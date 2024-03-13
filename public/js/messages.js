$(document).on("ready", function() {   
    var currentChatUserId

    const socket = io({
        query: {
          userId: $("#message-page").attr("userid")
        }
    });

	socket.on('chat message', function(msg) {
        $(".typing-indicator").remove()
        
        const SenderId = $("#message-page").attr("userid")

        var CurrentDate = new Date(msg.timestamp).toLocaleString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });

        const messageElement = `
			<div class="main-message-box ${(msg.senderId == SenderId) ? 'ta-right' : ''}">
				<div class="message-dt">
					<div class="message-inner-dt">
						<p>${msg.text}</p>
					</div>
					<span>${CurrentDate}</span>
				</div>
				<div class="messg-usr-img">
					<img src="${msg.userImage}" alt="">
				</div>
			</div>
		`;

		$(".mCSB_container").append(messageElement);
        $(".mCustomScrollbar").mCustomScrollbar("scrollTo", "bottom");

        let lastMessageElement = $(`.user-messageselector[selected-userid="${msg.senderId}"]`).find('.usr-mg-info p');
        let postedTimeElement = $(`.user-messageselector[selected-userid="${msg.senderId}"]`).find('.posted_time');

        let truncatedText = msg.text.length > 22 ? msg.text.slice(0, 22) + '...' : msg.text;

        lastMessageElement.text(truncatedText);

        let messageDate = new Date(msg.timestamp);
        let formattedTime = messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        postedTimeElement.text(formattedTime);
	});

    let typingTimeout;

    $("input[name='message']").on('input', function() {
        clearTimeout(typingTimeout);
        socket.emit('typing', { sender: $("#message-page").attr("userid"), recipient: currentChatUserId });

        typingTimeout = setTimeout(function() {
            socket.emit('stop typing', { sender: $("#message-page").attr("userid"), recipient: currentChatUserId });
        }, 500);
    });

    socket.on('typing', function(data) {
        if ($(".typing-indicator").length === 0) {
            const typingIndicator = `
                <div class="main-message-box st3 typing-indicator">
                    <div class="message-dt st3">
                        <div class="message-inner-dt">
                            <p>...</p>
                        </div>
                        <span>Typing...</span>
                    </div>
                </div>
            `;
            
            $("#mCSB_1_container").append(typingIndicator);
            $(".mCustomScrollbar").mCustomScrollbar("scrollTo", "bottom");

            animateTypingIndicator();
        }
    });

    socket.on('stop typing', function(data) {
        $(".typing-indicator").fadeOut(1250, function() { $(this).remove() });
    });

    function animateTypingIndicator() {
        let dots = 1;
        const minDots = 1;
        const maxDots = 3;
        const typingIndicator = $(".typing-indicator .message-inner-dt p");
    
        if (typingIndicator.length) {
            const interval = setInterval(() => {
                let dotsText = '';
                                
                for (let i = 1; i < dots + 1; i++) { dotsText += '.' }

                typingIndicator.text(`${dotsText}`);
    
                if ($(".typing-indicator").length === 0) {
                    dots = 1
                    clearInterval(interval);
                } else {
                    if (dots != maxDots) dots += 1
                    else dots = minDots
                }
            }, 800);
        }
    }

    $(".user-messageselector").click(function() {
        var UserMessageSelected = $(this)

        currentChatUserId = UserMessageSelected.attr("selected-userid")
        const myUserId = $("#message-page").attr("userid")

        const room = [myUserId, currentChatUserId].sort().join("_");

        socket.emit('join chat', room);

        $.ajax({
            url: '/get-chat-by-userid',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ Selected_UserId: currentChatUserId }),
            success: function(response) {
                var UserStatus = UserMessageSelected.find(".msg-status").hasClass("online") ? "Online" : "Offline"

                $("#chat-username").html(UserMessageSelected.find(".user-messageselector .usr-mg-info h3").html())
                $("#chat-user_status").html(UserStatus)
                $(".message-bar-head .usr-ms-img img").attr("src", UserMessageSelected.find(".usr-ms-img img").attr("src"))
                var chat = response;
                var messagesLine = $("#mCSB_1_container");

                $(".custom-chatbox").remove()
        
                chat.messages.forEach(function(message) {
                    var CurrentDate = new Date(message.timestamp).toLocaleString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });

                    var messageBoxClass = (message.senderId == currentChatUserId) ? "main-message-box custom-chatbox" : "main-message-box ta-right custom-chatbox";
                    var messageHtml = '<div class="' + messageBoxClass + '">' +
                                        '<div class="message-dt">' +
                                            '<div class="message-inner-dt">' +
                                                '<p>' + message.text + '</p>' +
                                            '</div>' +
                                            '<span>' + CurrentDate + '</span>' +
                                        '</div>' +
                                        '<div class="messg-usr-img">' +
                                            '<img src="' + message.userImage + '" alt="User Image">' +
                                        '</div>' +
                                      '</div>';
        
                    messagesLine.append(messageHtml);
                });
        
                $(".block-container").remove()
                $(".mCustomScrollbar").mCustomScrollbar("scrollTo", "bottom");
            },
            error: function(error) {
                console.error('Error fetching chat:', error.responseText);
                alert('Failed to fetch chat.');
            }
        });
    })

    $("#SendMsg-Forms").submit(function(event) {
        event.preventDefault()
        SendMsg()
    })

	$("#SendMSG").click( SendMsg );

    function SendMsg() {
        const senderId  = $("#message-page").attr("userid")
		const message = $("input[name='message']").val();

        socket.emit('chat message', { sender: senderId, recipient: currentChatUserId, context: message });

		$("input[name='message']").val('');
    }
})