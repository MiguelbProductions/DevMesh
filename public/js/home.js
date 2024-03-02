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
    $('#postbody-content').attr('placeholder', SelectedPlaceholder);

    $("#postbody-content").keyup(function() {
        var content = $(this).val();
        var wordsCount = countWords(content);
        var minWords = 10; 

        if(wordsCount >= minWords) {
            $(".btn-publish").removeClass('btn-secondary').addClass('btn-success');
        } else {
            $(".btn-publish").removeClass('btn-success').addClass('btn-secondary');
        }
    });
});


function countWords(s){
    s = s.replace(/(^\s*)|(\s*$)/gi,""); // remove espaços do inicio e do fim
    s = s.replace(/[ ]{2,}/gi," "); // reduz multiplos espaços para um único
    s = s.replace(/\n /,"\n"); // exclui novas linhas com espaços iniciais
    return s.split(' ').length;
}