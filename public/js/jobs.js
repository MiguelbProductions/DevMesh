$(document).ready(function() {
    $('#postJobForm').on('submit', function(e) {
        e.preventDefault();
        
        var formData = {
            jobTitle: $('#jobTitle').val(),
            jobLocation: $('#jobLocation').val(),
            jobType: $('#jobType').val(),
            jobPayment: $('#jobPayment').val(),
            jobDescription: $('#jobDescription').val(),
            jobTags: $('#jobTags').val().split(',').map(tag => tag.trim())
        };

        $.ajax({
            type: 'POST',
            url: '/post-job',
            data: formData,
            success: function(response) {
                alert('Job posted successfully!');
                window.location.reload();
            },
            error: function(xhr, status, error) {
                alert('Error posting job: ' + error);
            }
        });
    });
});