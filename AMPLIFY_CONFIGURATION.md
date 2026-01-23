## Amplify Rewrite Configuration

To fix the CORS issues and allow the application to connect to the backend API, you must configure a Rewrite rule in your AWS Amplify Console.

1.  Navigate to **App settings** > **Rewrites and redirects**.
2.  Click **Edit**.
3.  Add the following rule:

| Source address | Target address | Type |
| :--- | :--- | :--- |
| `/api/<*>` | `https://demo.apps.easygds.com/api/<*>` | 200 (Rewrite) |

**JSON Representation:**
```json
[
    {
        "source": "/api/<*>",
        "target": "https://demo.apps.easygds.com/api/<*>",
        "status": "200",
        "condition": null
    }
]
```

This configuration proxies all requests from `https://your-app.com/api/...` to `https://demo.apps.easygds.com/api/...`, bypassing the browser's CORS restrictions.
