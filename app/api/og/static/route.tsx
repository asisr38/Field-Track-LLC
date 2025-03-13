import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  try {
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
            backgroundColor: "#0c4a6e",
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
              width: "90%",
              height: "80%"
            }}
          >
            <h1
              style={{
                fontSize: "60px",
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
                marginBottom: "20px"
              }}
            >
              Field Track
            </h1>
            <p
              style={{
                fontSize: "32px",
                color: "white",
                textAlign: "center",
                maxWidth: "800px"
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
