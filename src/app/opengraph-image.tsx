import { ImageResponse } from 'next/og';

export const alt = "Chaukas · a 3-minute scam fire-drill";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#F6F3EC',
          border: '2px solid #111111',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Orange bar */}
          <div
            style={{
              width: '140px',
              height: '14px',
              backgroundColor: '#FF5A1F',
              marginBottom: '48px',
              borderRadius: '4px',
            }}
          />
          {/* Headline */}
          <div
            style={{
              fontSize: '68px',
              fontWeight: 900,
              color: '#111111',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              maxWidth: '960px',
            }}
          >
            Get scammed here. Never out there.
          </div>
        </div>

        {/* Sub-line */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#111111',
            opacity: 0.85,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Chaukas · a 3-minute scam fire-drill
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
