document.addEventListener('DOMContentLoaded', function() {
    // Mobile view toggle
    const formPanel = document.querySelector('.form-panel');
    const displayPanel = document.querySelector('.display-panel');
    const formBtn = document.getElementById('mobile-form-btn');
    const displayBtn = document.getElementById('mobile-display-btn');
    
    function showForm() {
        formPanel.style.display = 'flex';
        displayPanel.style.display = 'none';
        formBtn.style.background = '#2c6cb0';
        displayBtn.style.background = '#1f4e79';
    }
    
    function showDisplay() {
        formPanel.style.display = 'none';
        displayPanel.style.display = 'flex';
        formBtn.style.background = '#1f4e79';
        displayBtn.style.background = '#2c6cb0';
    }
    
    // Check screen width and set initial state
    if (window.innerWidth < 768) {
        showDisplay(); // Start with display panel on mobile
        document.querySelector('.mobile-menu').style.display = 'flex';
    }
    
    // Add event listeners for mobile buttons
    formBtn.addEventListener('click', showForm);
    displayBtn.addEventListener('click', showDisplay);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth < 768) {
            document.querySelector('.mobile-menu').style.display = 'flex';
            // Make sure both panels are visible for toggling
            formPanel.style.display = 'none';
            displayPanel.style.display = 'flex';
        } else {
            document.querySelector('.mobile-menu').style.display = 'none';
            // Reset to both visible on larger screens
            formPanel.style.display = 'flex';
            displayPanel.style.display = 'flex';
        }
    });

    // Function to format time in 12-hour format with AM/PM
    function formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }

    // Function to update the time field
    function updateTime() {
        const now = new Date();
        const formattedTime = formatTime(now);
        document.getElementById('it-time-field').value = formattedTime;
        
        // Update timestamp field as well
        const timestamp = now.toISOString().slice(0, 16);
        document.getElementById('it-timestamp-field').value = timestamp;
    }

    // Initialize time and update every second for real-time sync
    updateTime();
    setInterval(updateTime, 1000); // Update every second

    // Initialize Select2 for the IT system
    $('.branch-select').select2({
        placeholder: "Select a branch",
        allowClear: true,
        width: '100%'
    });

    // Function to generate the next ticket number
    function generateNextTicketNumber(lastNumber, prefix) {
        if (!lastNumber) return prefix + '-1';
        const numericPart = parseInt(lastNumber.split('-')[1]);
        return prefix + '-' + (numericPart + 1);
    }

    // Get the last ticket number from storage
    function getLastTicketNumber(prefix, callback) {
        let lastNumber = localStorage.getItem('lastTicketNumber_' + prefix);
        if (!lastNumber) {
            lastNumber = prefix + '-0';
            localStorage.setItem('lastTicketNumber_' + prefix, lastNumber);
        }
        callback(lastNumber);
    }

    // Set up the IT ticket number field
    getLastTicketNumber('IT', function(lastNumber) {
        const nextNumber = generateNextTicketNumber(lastNumber, 'IT');
        $('#it-ticket-number').val(nextNumber);
        localStorage.setItem('lastTicketNumber_IT', nextNumber);
    });

    // Reset IT ticket number
    $('#it-reset-ticket').click(function() {
        getLastTicketNumber('IT', function(lastNumber) {
            const nextNumber = generateNextTicketNumber(lastNumber, 'IT');
            $('#it-ticket-number').val(nextNumber);
            localStorage.setItem('lastTicketNumber_IT', nextNumber);
        });
    });

    // Validate IT ticket number
    $('#it-ticket-number').on('blur', function() {
        if (!/^IT-\d+$/.test($(this).val())) {
            alert('Please enter a valid ticket number in the format IT-1, IT-2, etc.');
            $(this).focus();
        }
    });

    // IT branch management
    $('#it-add-branch').click(function() {
        const newBranch = prompt("Enter new branch name:");
        if (newBranch && newBranch.trim() !== "") {
            if (!$('.branch-select option[value="' + newBranch + '"]').length) {
                $('.branch-select').append(new Option(newBranch, newBranch));
                $('.branch-select').val(newBranch).trigger('change');
            } else {
                alert("This branch already exists!");
            }
        }
    });

    $('#it-delete-branch').click(function() {
        const selectedBranch = $('.branch-select').val();
        if (selectedBranch) {
            if (confirm(`Are you sure you want to delete branch: ${selectedBranch}?`)) {
                $('.branch-select option[value="' + selectedBranch + '"]').remove();
                $('.branch-select').val(null).trigger('change');
            }
        } else {
            alert("Please select a branch to delete");
        }
    });

    // IT form submission
    $('#it-submit-btn').click(function(e) {
        e.preventDefault();
        const ticketNumber = $('#it-ticket-number').val();
        if (!/^IT-\d+$/.test(ticketNumber)) {
            alert('Please enter a valid ticket number in the format IT-1, IT-2, etc.');
            $('#it-ticket-number').focus();
            return;
        }

        const formData = new FormData(document.getElementById('it-form'));
        const itScriptURL = 'https://script.google.com/macros/s/AKfycbx3bzdovCAP1-j5YCjrzIM4N5V2W52QPKgM9fW-o9ylVNLgBotDropKOKNDu19GjfXo/exec';

        fetch(itScriptURL, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                alert("✅ IT ticket submitted successfully!");
                location.reload();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert("❌ Error submitting IT ticket. Please try again.");
        });
    });
});