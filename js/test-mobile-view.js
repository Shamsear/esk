/**
 * Test Mobile View JS
 * This script adds a floating control panel to test mobile background placement
 * without needing an actual mobile device.
 * 
 * Instructions:
 * 1. Add this script to your page: <script src="js/test-mobile-view.js"></script>
 * 2. Use the controls to simulate different device sizes and orientations
 */

(function() {
    // Only run in development environments
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.get('debug')) {
            return;
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Create control panel
        const panel = document.createElement('div');
        panel.id = 'mobile-test-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #3498db;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 9999;
            max-width: 280px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
        `;

        // Add title
        const title = document.createElement('h3');
        title.innerText = 'Mobile View Tester';
        title.style.cssText = 'margin: 0 0 10px 0; font-size: 16px; text-align: center;';
        panel.appendChild(title);

        // Add preset buttons
        const presets = [
            { label: 'iPhone SE', width: 375, height: 667 },
            { label: 'iPhone 12', width: 390, height: 844 },
            { label: 'Galaxy S20', width: 360, height: 800 },
            { label: 'iPad Mini', width: 768, height: 1024 },
        ];

        const presetContainer = document.createElement('div');
        presetContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;';

        presets.forEach(preset => {
            const button = document.createElement('button');
            button.innerText = preset.label;
            button.style.cssText = 'flex: 1; min-width: 80px; padding: 5px; background: #2c3e50; border: 1px solid #3498db; color: white; cursor: pointer; border-radius: 4px;';
            button.addEventListener('click', () => {
                window.resizeTo(preset.width, preset.height);
                updateWindowInfo();
            });
            presetContainer.appendChild(button);
        });

        panel.appendChild(presetContainer);

        // Add orientation buttons
        const orientationContainer = document.createElement('div');
        orientationContainer.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';

        const portraitBtn = document.createElement('button');
        portraitBtn.innerText = 'Portrait';
        portraitBtn.style.cssText = 'flex: 1; padding: 7px; background: #2c3e50; border: 1px solid #3498db; color: white; cursor: pointer; border-radius: 4px;';
        portraitBtn.addEventListener('click', () => {
            const width = Math.min(window.outerWidth, window.outerHeight);
            const height = Math.max(window.outerWidth, window.outerHeight);
            window.resizeTo(width, height);
            updateWindowInfo();
        });

        const landscapeBtn = document.createElement('button');
        landscapeBtn.innerText = 'Landscape';
        landscapeBtn.style.cssText = 'flex: 1; padding: 7px; background: #2c3e50; border: 1px solid #3498db; color: white; cursor: pointer; border-radius: 4px;';
        landscapeBtn.addEventListener('click', () => {
            const width = Math.max(window.outerWidth, window.outerHeight);
            const height = Math.min(window.outerWidth, window.outerHeight);
            window.resizeTo(width, height);
            updateWindowInfo();
        });

        orientationContainer.appendChild(portraitBtn);
        orientationContainer.appendChild(landscapeBtn);
        panel.appendChild(orientationContainer);

        // Add window size info
        const infoDisplay = document.createElement('div');
        infoDisplay.id = 'window-info';
        infoDisplay.style.cssText = 'background: rgba(0, 0, 0, 0.4); padding: 8px; border-radius: 4px; font-size: 14px; text-align: center;';
        panel.appendChild(infoDisplay);

        // Toggle button to hide/show panel
        const toggleBtn = document.createElement('button');
        toggleBtn.innerText = 'Hide Panel';
        toggleBtn.style.cssText = 'width: 100%; padding: 5px; margin-top: 10px; background: #3498db; border: none; color: white; cursor: pointer; border-radius: 4px;';
        toggleBtn.addEventListener('click', () => {
            const panelContent = panel.querySelectorAll('*:not(button:last-child)');
            panelContent.forEach(el => {
                el.style.display = el.style.display === 'none' ? '' : 'none';
            });
            toggleBtn.innerText = toggleBtn.innerText === 'Hide Panel' ? 'Show Panel' : 'Hide Panel';
        });
        panel.appendChild(toggleBtn);

        document.body.appendChild(panel);

        // Function to update window information
        function updateWindowInfo() {
            const info = document.getElementById('window-info');
            const width = window.innerWidth;
            const height = window.innerHeight;
            const isPortrait = height > width;

            info.innerHTML = `
                Window: ${width}×${height}px<br>
                Orientation: ${isPortrait ? 'Portrait' : 'Landscape'}<br>
                Media: ${width <= 768 ? 'Mobile' : 'Desktop'}
            `;

            // Force reload of background styles if our script is present
            if (typeof updateBackgroundStyles === 'function') {
                updateBackgroundStyles();
            } else {
                // Attempt to trigger a resize event to refresh any media query effects
                const resizeEvent = new Event('resize');
                window.dispatchEvent(resizeEvent);
            }
        }

        // Initialize window info
        updateWindowInfo();

        // Listen for resize events
        window.addEventListener('resize', updateWindowInfo);
    });
})(); 