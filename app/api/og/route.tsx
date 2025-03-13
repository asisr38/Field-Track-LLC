import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    // Get the search params from the request
    const { searchParams } = new URL(req.url);

    // Get title from search params or use default
    const title = searchParams.get("title") || "Field Track";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0c4a6e", // A deep blue color
            backgroundImage:
              "linear-gradient(to bottom right, #0c4a6e, #0e7490)",
            padding: "40px"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "4px solid #e2e8f0",
              borderRadius: "24px",
              padding: "40px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              width: "90%",
              height: "80%"
            }}
          >
            <img
              src={`${
                process.env.NEXT_PUBLIC_APP_URL ||
                "https://field-track-llc.vercel.app/"
              }/logo/field-track-logo.png`}
              alt="Field Track Logo"
              width={300}
              height={100}
              style={{ marginBottom: "20px" }}
            />
            <h1
              style={{
                fontSize: "60px",
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
                marginBottom: "20px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "32px",
                color: "white",
                textAlign: "center",
                maxWidth: "800px",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
              }}
            >
              Technology-driven Strategies for Land Management
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500
    });
  }
}
