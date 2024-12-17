const boilerplate = (content: string) => `<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="app.css"><link rel="stylesheet" href="https://unpkg.com/pyro@0.1.23/dist/basic.css">  
    <script src="https://unpkg.com/pyro/dist/all.js" type="module"></script>
    <title>Ian</title>
</head>

<body class="basic">
    <main>
        ${content}
    </main>
</body>

</html>
`;
export const html = (content: string) => boilerplate(content);
