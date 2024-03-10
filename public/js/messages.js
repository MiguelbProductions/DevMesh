$(document).on("ready", function() {
    $(".user-messageselector").click(function() {
        var Selected_UserId = $(this).attr("selected-userid")

        $.ajax({
            url: '/get-chat-by-userid',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ Selected_UserId: Selected_UserId }),
            success: function(response) {
                var chat = response;
                var messagesLine = $(".messages-line");
                messagesLine.empty();
        
                chat.messages.forEach(function(message) {
                    var messageBoxClass = (message.sender == Selected_UserId) ? "main-message-box" : "main-message-box ta-right";
                    var messageHtml = '<div class="' + messageBoxClass + '">' +
                                        '<div class="message-dt">' +
                                            '<div class="message-inner-dt">' +
                                                '<p>' + message.message + '</p>' +
                                            '</div>' +
                                            '<span>' + new Date(message.timestamp).toLocaleString() + '</span>' +
                                        '</div>' +
                                        '<div class="messg-usr-img">' +
                                            '<img src="/public/images/resources/m-img1.png" alt="">' +
                                        '</div>' +
                                      '</div>';
        
                    messagesLine.append(messageHtml);
                });
        
                $("#chat-username").text(response.participants.filter(participant => participant._id != Selected_UserId)[0].name); 
                $("#chat-user_status").text("Online");
            },
            error: function(error) {
                console.error('Error fetching chat:', error.responseText);
                alert('Failed to fetch chat.');
            }
        });
        
    })
})