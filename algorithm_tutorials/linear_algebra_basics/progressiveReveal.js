document.addEventListener("DOMContentLoaded", function() {
    // Initially, only step-1 is visible as per CSS. If needed, you could also set a variable to track currentStep.
    
    // Add event listeners to all "Next" buttons
    const nextButtons = document.querySelectorAll('.next-button');
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepContainer = button.closest('.step-container');
            const nextStepId = button.getAttribute('data-next-step');
            const nextStepContainer = document.getElementById(nextStepId);

            // Hide current step
            currentStepContainer.style.display = 'none';

            // Show next step
            nextStepContainer.style.display = 'block';
        });
    });
});