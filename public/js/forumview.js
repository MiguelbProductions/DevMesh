$(document).ready(function() {
    $('#commentForm').submit(function(e) {
        e.preventDefault();

        const postId = $('input[name="postId"]').val();
        const commentText = $('textarea[name="commentText"]').val().trim();

        if (commentText) {
            $.ajax({
                url: '/forum-post-comment',
                type: 'POST',
                data: { postId: postId, comment: commentText },
                success: function(response) {
                    alert('Comment posted successfully!');

                    window.location.reload();
                },
                error: function() {
                    alert('Error posting comment. Please try again.');
                }
            });
        } else {
            alert('Please enter a comment before posting.');
        }
    });

    $('#like-button').on('click', function(e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/forum-post-like',
            data: { postId: $("#forum-page").attr("post-id") }, 
            success: function(data) {
                window.location.reload();
            },
            error: function(err) {
                console.error(err);
            }
        });
    });

    $('#share-button').on('click', async function(e) {
        e.preventDefault();
        
        var postUrl = window.location.href;
    
        try {
            const clipboardText = await navigator.clipboard.readText();
    
            if (clipboardText === postUrl) {
                alert('Post URL is already in the clipboard.');
            } else {
                await navigator.clipboard.writeText(postUrl);
                alert('Post URL copied to clipboard!');

                $.ajax({
                    type: 'POST',
                    url: '/forum-post-share',
                    data: { postId: $("#forum-page").attr("post-id") },
                    success: function(data) {
                        alert('Post shared successfully!');
                        window.location.reload();
                    },
                    error: function() {
                        alert('Error sharing the post. Please try again.');
                    }
                });
            }
        } catch (error) {
            console.error('Error accessing the clipboard:', error);
            fallbackCopyTextToClipboard(postUrl);
        }
    });
    
    function fallbackCopyTextToClipboard(text) {
        var tempInput = document.createElement('input');
        tempInput.style = 'position: absolute; left: -1000px; top: -1000px';
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('Post URL copied to clipboard!');
    }
    
});
