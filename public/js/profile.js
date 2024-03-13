$(document).on("ready", function() {
    $(document).on('click', '.update-social', function() {
        var social = $(this).data('social');
        var value = $(this).parent().parent().find('.social-input').val();

        if(value) {
            $.ajax({
                url: '/update-social',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ social: social, value: value }),
                success: function(response) {
                    alert('Social media link updated successfully!');
                    window.location.reload();
                },
                error: function(error) {
                    console.error(error);
                    alert('Failed to update social media link.');
                }
            });
        } else {
            alert('Please provide a valid URL.');
        }
    });

    $('#editAboutIcon').click(function() { $('#editAboutModal').modal('show'); });
    $('#addExperienceIcon').click(function() { $('#addExperienceModal').modal('show'); });
    $('#addEducationIcon').click(function() { $('#addEducationModal').modal('show'); });
    $('#addSkillsIcon').click(function() { $('#addSkillsModal').modal('show'); });
    $('#editLocationIcon').click(function() { $('#editLocationModal').modal('show'); });

    // Add Experience
    $('#addExperience').click(function() {
        var role = $('#expRole').val();
        var company = $('#expCompany').val();
        var startYear = $('#expStartYear').val();
        var endYear = $('#expEndYear').val();
        var description = $('#expDescription').val();
    
        $.ajax({
            url: '/add-experience',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ role, company, startYear, endYear, description }),
            success: function(response) {
                alert('Experience added successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error(error);
                alert('Failed to add experience.');
            }
        });
    });
    
    // Add Education
    $('#addEducation').click(function() {
        var degree = $('#eduDegree').val();
        var school = $('#eduSchool').val();
        var startYear = $('#eduStartYear').val();
        var endYear = $('#eduEndYear').val();
        var description = $('#eduDescription').val();

        $.ajax({
            url: '/add-education',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ degree, school, startYear, endYear, description }),
            success: function(response) {
                alert('Education added successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error(error);
                alert('Failed to add education.');
            }
        });
    });

    // Update Skills
    $('#addSkill').click(function() {
        var skill = $('#newSkill').val();

        $.ajax({
            url: '/update-skills',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ skill }),
            success: function(response) {
                alert('Skill added successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error(error);
                alert('Failed to add skill.');
            }
        });
    });

    // Edit About Me
    $('#saveAboutMe').click(function() {
        var about = $('#aboutMeText').val();

        $.ajax({
            url: '/edit-about',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ about }),
            success: function(response) {
                alert('About Me updated successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error(error);
                alert('Failed to update About Me.');
            }
        });
    });

    // Edit Location
    $('#saveLocation').click(function() {
        var location = $('#newLocation').val();

        $.ajax({
            url: '/edit-location',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ location }),
            success: function(response) {
                alert('Location updated successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error(error);
                alert('Failed to update location.');
            }
        });
    });

    $('.save-edu-changes').on('click', function() {
        var index = $(this).data('index'); // Índice do item de educação
        var modal = $('#editEducationModal' + index); // Seletor do modal específico
        
        // Captura os valores dos campos
        var degree = modal.find('.edu-degree').val();
        var school = modal.find('.edu-school').val();
        var startYear = modal.find('.edu-start-year').val();
        var endYear = modal.find('.edu-end-year').val();
        var description = modal.find('.edu-description').val();
        
        // Objeto com os dados capturados para enviar
        var eduData = {
            index: index,
            degree: degree,
            school: school,
            startYear: startYear,
            endYear: endYear,
            description: description
        };
        
        $.ajax({
            url: '/edit-educationitem',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(eduData),
            success: function(response) {
                alert('Education updated successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error('Erro ao atualizar educação', error);
            }
        });
    });
    
    $('.save-exp-changes').on('click', function() {
        var index = $(this).data('index'); // Índice do item de educação
        var modal = $('#editExperienceModal' + index); // Seletor do modal específico
        // Captura os valores dos campos
        var role = modal.find('.exp-role').val();
        var company = modal.find('.exp-company').val();
        var startYear = modal.find('.exp-start-year').val();
        var endYear = modal.find('.exp-end-year').val();
        var description = modal.find('.exp-description').val();
        
        // Objeto com os dados capturados para enviar
        var eduData = {
            index: index,
            role: role,
            company: company,
            startYear: startYear,
            endYear: endYear,
            description: description
        };

        $.ajax({
            url: '/edit-experienceitem',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(eduData),
            success: function(response) {
                alert('Education updated successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error('Erro ao atualizar educação', error);
            }
        });
    });

    $(document).on('click', '.delete-experienceitem', function() {
        if(confirm('Are you sure you want to delete this experience?')) {
            var index = $(this).data('index');
            $.ajax({
                url: '/delete-experience',
                type: 'POST',
                data: JSON.stringify({ index: index }),
                contentType: 'application/json',
                success: function(response) {
                    alert('Experience deleted successfully!');
                    window.location.reload();
                },
                error: function(error) {
                    console.error('Error deleting experience:', error);
                    alert('Failed to delete experience.');
                }
            });
        }
    });
    
    $(document).on('click', '.delete-educationitem', function() {
        if(confirm('Are you sure you want to delete this experience?')) {
            var index = $(this).data('index');
            $.ajax({
                url: '/delete-education',
                type: 'POST',
                data: JSON.stringify({ index: index }),
                contentType: 'application/json',
                success: function(response) {
                    alert('Experience deleted successfully!');
                    window.location.reload();
                },
                error: function(error) {
                    console.error('Error deleting experience:', error);
                    alert('Failed to delete experience.');
                }
            });
        }
    });
    
    $('.delete-skill').on('click', function() {
        const skillToDelete = $(this).data('skill');

        $.ajax({
            url: '/delete-skill',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ skill: skillToDelete }),
            success: function(response) {
                alert('Skill deleted successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error('Error deleting skill', error);
            }
        });
    });

    $(".save-project").click(function() {
        var formData = new FormData();
        var projectImage = document.getElementById('projectImage').files[0];
        var projectLink = document.getElementById('projectLink').value;
        formData.append('projectImage', projectImage);
        formData.append('projectLink', projectLink);
    
        $.ajax({
            url: '/add-project',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                alert('Project added successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error(error);
            }
        });
    })

    $('.star-label').click(function() {
        var StarLevel = $(this).attr("star-level")
        $('.star-label').removeClass('gold');

        $('#starRating').val(StarLevel);

        for (var starindex = StarLevel; starindex > 0; starindex--) {
            $('[star-level="' +  starindex + '"]').addClass('gold');
        }
    });
    
    $('form').submit(function(e) {
        e.preventDefault(); 

        var formData = {
            starRating: $('#starRating').val(),
            reviewText: $('textarea[name="reviewText"]').val(),
            ratteduserid: $(".submit-review").attr("user-id")
        };

        $.ajax({
            type: 'POST',
            url: '/add-review',
            data: JSON.stringify(formData),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(response) {
                alert('Review submitted successfully!');
                window.location.reload();
            },
            error: function(error) {
                console.error('Error submitting review:', error);
                alert('Failed to submit review.');
            }
        });
    });

    $('#profileImage').change(function(e) {
        var formData = new FormData();
        var files = $('#profileImage')[0].files;

        if (files.length > 0) {
            formData.append('profileimage', files[0]);

            $.ajax({
                url: '/update-profile-image',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {
                    alert('Profile image updated successfully!');
                    window.location.reload();
                },
                error: function(xhr, status, error) {
                    console.error('Failed to update profile image:', error);
                    alert('Failed to update profile image.');
                }
            });
        }
    });
    
    $('#profileThumbImage').change(function(e) {
        var formData = new FormData();
        var files = $('#profileThumbImage')[0].files;

        if (files.length > 0) {
            formData.append('profilethumbimage', files[0]);

            $.ajax({
                url: '/update-profile-thumb-image',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {
                    alert('Profile Thumb image updated successfully!');
                    window.location.reload();
                },
                error: function(xhr, status, error) {
                    console.error('Failed to update profile image:', error);
                    alert('Failed to update profile image.');
                }
            });
        }
    })
    

    $(".friend-control").click(function() {
        var requestUserId = $(this).attr('request-userid');
        var action = $(this).attr('action');

        $.ajax({
            url: '/handle-friend-request',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ requestUserId, action }),
            success: function(response) {
                alert(response.message);
                window.location.reload();
            },
            error: function(error) {
                console.error('Error handling friend request:', error.responseText);
                alert('Failed to handle friend request.');
            }
        });

       
    })
})