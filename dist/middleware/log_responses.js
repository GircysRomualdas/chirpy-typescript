export async function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode > 299) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}
