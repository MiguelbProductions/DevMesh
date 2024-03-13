$(document).ready(function() {
    var placeholders = [
        "What's the latest tech you've experimented with?",
        "Any cool design patterns you've discovered?",
        "Share your most recent coding challenge and how you solved it.",
        "What's a tech tool you can't live without and why?",
        "Have you encountered any interesting bugs lately?",
        "What's your favorite programming language, and why?",
        "Share a useful resource for learning web development or design.",
        "What UI/UX design tips do you have to share?",
        "Got any tips for optimizing website performance?",
        "What's a piece of tech news that excited you recently?",
        "How do you stay updated with the latest tech trends?",
        "What's your current side project about?",
        "How do you approach problem-solving in coding?",
        "What's a new framework or library you're exploring?",
        "Share a coding hack you think everyone should know.",
        "What's a common misconception in tech you'd like to debunk?"
    ];    

    var SelectedPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)]
    $('#postbody-content').attr('placeholder', SelectedPlaceholder + " (Min 10 words)");

    $("#postbody-title").keyup(verifyvalidation);
    $("#postbody-content").keyup(verifyvalidation);
    $("#postbody-tags").keyup(verifyvalidation);

    $(document).on('click', '.btn-publish.btn-success', function() {
        const title = $('#postbody-title').val();
        const content = $('#postbody-content').val();
        const tags = $('#postbody-tags').val().split(',').map(tag => tag.trim());

    
        $.ajax({
            url: '/addpost',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ title, content, tags }),
            success: function(response) {
                alert('Post published successfully!');

                window.location.reload();
            },
            error: function(error) {
                console.error(error);
                alert('Failed to publish post.');
            }
        });
    });

    $('#postQuestionBtn').click(function() {
        var title = $('#title').val();
        var body = tinymce.activeEditor.getContent();
        var tags = $('#tags').val();

        if (title && body && tags) {
            $.ajax({
                url: '/post-question',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    userid: null,
                    title: title,
                    body: body,
                    tags: tags.split(','),
                    postDate: new Date(),
                    comments: [],
                    likes: [],
                    views: 0,
                    shares: 0,
                }),
                success: function(response) {
                    $('#postQuestionModal').modal('hide');
                    alert('Question posted successfully!');
                },
                error: function(error) {
                    alert('Error posting question.');
                }
            });
        } else {
            alert('Please fill out all fields.');
        }
    });
});

function verifyvalidation() {
    var Post_Title = $("#postbody-title").val();
    var Post_Content = $("#postbody-content").val();
    var Post_Tags = $("#postbody-tags").val();

    var NumWords_Title = countWords(Post_Title);
    var NumWords_Content = countWords(Post_Content);
    var NumTags = countTags(Post_Tags);

    if (NumWords_Title >= 4 && NumWords_Content >= 10 && NumTags >= 2) {
        $(".btn-publish").removeClass('btn-secondary').addClass('btn-success');
    } else {
        $(".btn-publish").removeClass('btn-success').addClass('btn-secondary');
    }
}

function countWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");
    s = s.replace(/[ ]{2,}/gi, " ");
    s = s.replace(/\n /, "\n");
    return s.split(' ').filter(function(str){return str!="";}).length;
}

function countTags(s) {
    var tagsArray = s.split(',').map(function(tag) {
        return tag.trim();
    }).filter(function(tag) {
        return tag.length > 0;
    });
    return tagsArray.length;
}
