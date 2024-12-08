import { useState } from "preact/hooks";

const SENTINEL_HUB_TOKEN_ENDPOINT =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

const STAC_API_SERVERS = [
  {
    name: "AWS Earth Search",
    endpoint: "https://earth-search.aws.element84.com/v1/search",
    defaultCollection: "sentinel-2-l2a",
    requiresAuth: false,
    formatPayload: (params) => ({
      bbox: params.bbox ? JSON.parse(`[${params.bbox}]`) : undefined,
      datetime: params.datetime || undefined,
      collections: params.collections
        ? [params.collections]
        : ["sentinel-2-l2a"],
      limit: 10,
      query: {
        "eo:cloud_cover": { lt: params.cloudCoverLimit || 100 },
      },
    }),
  },
  {
    name: "Sentinel Hub",
    endpoint: "https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search",
    defaultCollection: "sentinel-2-l2a",
    requiresAuth: true,
    formatPayload: (params, accessToken) => ({
      collections: params.collections
        ? [params.collections]
        : ["sentinel-2-l2a"],
      bbox: params.bbox ? JSON.parse(`[${params.bbox}]`) : undefined,
      datetime: params.datetime || undefined,
      limit: 10,
      query: {
        "eo:cloud_cover": { lt: params.cloudCoverLimit || 100 },
      },
    }),
  },
];

const STACImageFinder = () => {
  const [searchParams, setSearchParams] = useState({
    bbox: "", // Geographic bounding box
    datetime: "", // Date/time range
    collections: "", // Satellite image collection
    cloudCoverLimit: 100,
    apiServer: STAC_API_SERVERS[0].name,
    clientId: "",
    clientSecret: "",
  });

  const [results, setResults] = useState([]);
  const [availableCollections, setAvailableCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Fetch Sentinel Hub access token
  const fetchSentinelHubToken = async () => {
    if (!searchParams.clientId || !searchParams.clientSecret) {
      throw new Error("Client ID and Client Secret are required");
    }

    try {
      const tokenResponse = await fetch(SENTINEL_HUB_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: searchParams.clientId,
          client_secret: searchParams.clientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token request failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      return tokenData.access_token;
    } catch (err) {
      console.error("Token fetch error:", err);
      throw err;
    }
  };

  // Fetch available collections dynamically
  const fetchCollections = async () => {
    try {
      const currentServer = STAC_API_SERVERS.find(
        (server) => server.name === searchParams.apiServer
      );

      const response = await fetch(
        `${currentServer.endpoint.replace("/search", "")}/collections`
      );
      const collectionsData = await response.json();
      setAvailableCollections(collectionsData.collections || []);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    }
  };

  // Handle search requests
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const currentServer = STAC_API_SERVERS.find(
        (server) => server.name === searchParams.apiServer
      );

      if (!currentServer) {
        throw new Error("Invalid API server selected");
      }

      // Fetch token if required
      let token = null;
      if (currentServer.requiresAuth) {
        token = await fetchSentinelHubToken();
        setAccessToken(token);
      }

      const limit = 10; // Number of results per batch
      let allResults = [];

      // Modify payload for Sentinel Hub API if required
      const payload =
        currentServer.name === "Sentinel Hub"
          ? {
              collections: searchParams.collections
                ? [searchParams.collections]
                : [currentServer.defaultCollection],
              bbox: searchParams.bbox
                ? JSON.parse(`[${searchParams.bbox}]`)
                : undefined,
              datetime: searchParams.datetime || undefined,
              fields: {
                include: ["id", "type", "bbox", "properties"],
                exclude: ["geometry", "links", "assets"],
              },
              filter: `eo:cloud_cover <= ${
                searchParams.cloudCoverLimit || 100
              }`,
              limit: limit,
            }
          : {
              bbox: searchParams.bbox
                ? JSON.parse(`[${searchParams.bbox}]`)
                : undefined,
              datetime: searchParams.datetime || undefined,
              collections: searchParams.collections
                ? [searchParams.collections]
                : [currentServer.defaultCollection],
              limit: limit,
              query: {
                "eo:cloud_cover": { lt: searchParams.cloudCoverLimit || 100 },
              },
            };

      const response = await fetch(currentServer.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/geo+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Search failed: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      allResults = [...allResults, ...data.features];

      setResults(allResults);
    } catch (err) {
      setError(err.message);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractImageMetadata = (item) => {
    const metadata = {
      thumbnail: null,
      cloudCover: item.properties?.["eo:cloud_cover"] || "N/A",
      date: item.properties?.datetime || "N/A",
      collection: item.collection || "N/A",
    };

    // Attempt to find a thumbnail
    const thumbnailAsset = item.assets?.thumbnail || item.assets?.preview;
    if (thumbnailAsset) {
      metadata.thumbnail = thumbnailAsset.href;
    }

    return metadata;
  };

  const handleDownload = (item) => {
    const downloadLink =
      item.assets?.visual?.href || item.assets?.["visual-full"]?.href;
    if (downloadLink) {
      window.open(downloadLink, "_blank");
    } else {
      alert("No downloadable asset found");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>STAC Satellite Image Finder</h2>

      <div style={{ marginBottom: "15px" }}>
        <select
          value={searchParams.apiServer}
          onChange={(e) => {
            setSearchParams({
              ...searchParams,
              apiServer: e.target.value,
              clientId: "",
              clientSecret: "",
            });
            fetchCollections();
          }}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          {STAC_API_SERVERS.map((server) => (
            <option key={server.name} value={server.name}>
              {server.name}
            </option>
          ))}
        </select>

        {searchParams.apiServer === "Sentinel Hub" && (
          <>
            <input
              type="text"
              placeholder="Sentinel Hub Client ID"
              value={searchParams.clientId}
              onInput={(e) =>
                setSearchParams({ ...searchParams, clientId: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <input
              type="password"
              placeholder="Sentinel Hub Client Secret"
              value={searchParams.clientSecret}
              onInput={(e) =>
                setSearchParams({
                  ...searchParams,
                  clientSecret: e.target.value,
                })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </>
        )}

        <input
          type="text"
          placeholder="Geographic BBox (13, 45, 14, 46)"
          value={searchParams.bbox}
          onInput={(e) =>
            setSearchParams({ ...searchParams, bbox: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Date Range (2020-12-10T00:00:00Z/2020-12-30T00:00:00Z)"
          value={searchParams.datetime}
          onInput={(e) =>
            setSearchParams({ ...searchParams, datetime: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Image Collection (default Sentinel-2 L2A)"
          value={searchParams.collections}
          onInput={(e) =>
            setSearchParams({ ...searchParams, collections: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <input
          type="range"
          min="0"
          max="100"
          value={searchParams.cloudCoverLimit}
          onInput={(e) =>
            setSearchParams({
              ...searchParams,
              cloudCoverLimit: e.target.value,
            })
          }
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <label>Max Cloud Cover: {searchParams.cloudCoverLimit}%</label>
      </div>

      <button
        onClick={handleSearch}
        disabled={
          loading ||
          (searchParams.apiServer === "Sentinel Hub" &&
            (!searchParams.clientId || !searchParams.clientSecret))
        }
        style={{ width: "100%", padding: "10px" }}
      >
        {loading ? "Searching..." : "Search Satellite Images"}
      </button>
      {error && (
        <div style={{ color: "red", textAlign: "center", marginTop: "15px" }}>
          Error: {error}
        </div>
      )}
      {results.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          {results.map((item, index) => {
            const metadata = extractImageMetadata(item);
            return (
              <div
                key={index}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                {metadata.thumbnail && (
                  <img
                    src={metadata.thumbnail}
                    alt="Thumbnail"
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      marginBottom: "10px",
                    }}
                  />
                )}
                <p>
                  <strong>Collection:</strong> {metadata.collection}
                </p>
                <p>
                  <strong>Date:</strong> {metadata.date}
                </p>
                <p>
                  <strong>Cloud Cover:</strong> {metadata.cloudCover}%
                </p>
                <button
                  onClick={() => handleDownload(item)}
                  style={{ marginTop: "10px", width: "100%", padding: "5px" }}
                >
                  Download
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default STACImageFinder;
