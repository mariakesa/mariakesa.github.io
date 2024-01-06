async function runPyodideCode() {
    // Load Pyodide
    await languagePluginLoader;

    // Your pre-generated data URL (replace with the actual URL)
    const preGeneratedDataUrl = 'https://raw.githubusercontent.com/mariakesa/mariakesa.github.io/main/allen-project/img/rastermap_test.png';

    // Use Pyodide to display the pre-generated image
    const img = new Image();
    img.src = preGeneratedDataUrl;
    document.body.appendChild(img);
}

// Call the function when the script is loaded
//https://hacks.mozilla.org/2019/04/pyodide-bringing-the-scientific-python-stack-to-the-browser/
//https://blog.pyodide.org/posts/canvas-renderer-matplotlib-in-pyodide/
//https://karay.me/2022/07/12/bringing-python-to-the-web.html
//https://austen.uk/post/online-demos-with-pyodide/