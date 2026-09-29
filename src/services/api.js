const API_BASE = "https://farmerai-2nic.onrender.com/api";

// ============================================================
// AUTH HEADER
// ============================================================

function getAuthHeader() {
    const token =
        localStorage.getItem("sahayak_token");

    return token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {};
}

// ============================================================
// GENERIC REQUEST
// ============================================================

async function request(
    endpoint,
    options = {}
) {
    const isFormData =
        options.body instanceof FormData;

    const headers = {
        ...(!isFormData
            ? {
                  "Content-Type":
                      "application/json",
              }
            : {}),

        ...getAuthHeader(),

        ...(options.headers || {}),
    };

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            ...options,
            headers,
        }
    );

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    const data =
        contentType.includes(
            "application/json"
        )
            ? await response.json()
            : await response.text();

    if (!response.ok) {
        const errorMessage =
            data?.detail ||
            data?.message ||
            (typeof data === "string"
                ? data
                : "An unexpected error occurred");

        const error =
            new Error(errorMessage);

        error.status =
            response.status;

        error.data = data;

        throw error;
    }

    return data;
}

// ============================================================
// API
// ============================================================

const api = {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    sendOtp: (identifier) =>
        request("/auth/send-otp", {
            method: "POST",
            body: JSON.stringify({
                identifier,
            }),
        }),

    resendOtp: (identifier) =>
        request("/auth/resend-otp", {
            method: "POST",
            body: JSON.stringify({
                identifier,
            }),
        }),

    verifyOtp: (
        identifier,
        otp,
        extraData = {}
    ) =>
        request("/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify({
                identifier,
                otp,
                ...extraData,
            }),
        }),

    // ============================================================
    // USER / PROFILE
    // ============================================================

    getCurrentUser: () =>
        request("/users/me"),

    getDemoUser: () =>
        request("/users/demo"),

    getProfile: () =>
        request("/profile"),

    updateProfile: (
        profileData
    ) =>
        request("/profile", {
            method: "PUT",
            body: JSON.stringify(
                profileData
            ),
        }),

    // ============================================================
    // AI CHAT
    // ============================================================

    sendChatMessage: (
        message,
        language = "en",
        input_mode = "text",
        user_id = null,
        conversation_id = "default"
    ) =>
        request("/chat", {
            method: "POST",

            body: JSON.stringify({
                message,
                language,
                input_mode,
                user_id,
                conversation_id,
            }),
        }),

    getChatHistory: () =>
        request("/chat/history"),

    clearChatHistory: () =>
        request("/chat/history", {
            method: "DELETE",
        }),

    // ============================================================
    // SCHEMES
    // ============================================================

    getSchemes: () =>
        request("/schemes"),

    searchSchemes: (
        user_type,
        requirement,
        state
    ) =>
        request("/schemes/search", {
            method: "POST",
            body: JSON.stringify({
                user_type,
                requirement,
                state,
            }),
        }),

    // ============================================================
    // KNOWLEDGE DOMAINS
    // ============================================================

    getPmfby: () =>
        request("/pmfby"),

    getPacs: () =>
        request("/pacs"),

    getCooperative: () =>
        request("/cooperative"),

    getFinancial: () =>
        request("/financial"),

    getOfficialSources: () =>
        request("/sources"),

    // ============================================================
    // RAG SEARCH
    // ============================================================

    ragSearch: (
        query,
        category = null,
        limit = 5
    ) =>
        request("/rag/search", {
            method: "POST",

            body: JSON.stringify({
                query,
                category,
                limit,
            }),
        }),

    // ============================================================
    // GRIEVANCE
    // ============================================================

    getGrievanceGuidance: (
        category,
        description
    ) =>
        request(
            "/grievance/guidance",
            {
                method: "POST",

                body: JSON.stringify({
                    category,
                    description,
                }),
            }
        ),

    draftGrievance: (
        grievanceData
    ) =>
        request(
            "/grievance/draft",
            {
                method: "POST",

                body: JSON.stringify(
                    grievanceData
                ),
            }
        ),

    getGrievances: () =>
        request("/grievances"),

    // ============================================================
    // VOICE
    // ============================================================

    synthesizeVoice: (
        text,
        language = "hi"
    ) =>
        request(
            "/voice/synthesize",
            {
                method: "POST",

                body: JSON.stringify({
                    text,
                    language,
                }),
            }
        ),

    transcribeVoice: (
        audioBlob,
        language = "hi"
    ) => {
        const formData =
            new FormData();

        formData.append(
            "audio",
            audioBlob,
            "speech.wav"
        );

        formData.append(
            "language",
            language
        );

        return request(
            "/voice/transcribe",
            {
                method: "POST",
                body: formData,
            }
        );
    },

    // ============================================================
    // ADMIN
    // ============================================================

    getAdminStats: () =>
        request("/admin/stats"),

    getDocuments: () =>
        request("/admin/documents"),

    uploadDocument: (
        formData
    ) =>
        request(
            "/admin/documents/upload",
            {
                method: "POST",
                body: formData,
            }
        ),

    reindexDocument: (
        doc_id
    ) =>
        request(
            `/admin/documents/index?doc_id=${doc_id}`,
            {
                method: "POST",
            }
        ),

    deleteDocument: (
        doc_id
    ) =>
        request(
            `/admin/documents/${doc_id}`,
            {
                method: "DELETE",
            }
        ),

    // ============================================================
    // HEALTH
    // ============================================================

    getHealth: () =>
        request("/health"),
};

// ============================================================
// EXPORTS
// ============================================================

export { api };

export default api;
