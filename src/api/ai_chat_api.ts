import {ApiUrls} from "star-horse-lowcode";
import {ref} from "vue";

const aiApi = ref<ApiUrls>();

export function initAiApi(api: ApiUrls) {
    aiApi.value = api;
}

/**
 * 发送 AI 对话消息（SSE 流式）
 * @param sessionId 会话ID
 * @param message 用户消息
 * @param onMessage 收到消息片段的回调
 * @param onDone 完成回调
 * @param onError 错误回调
 * @returns AbortController 用于取消请求
 */
export function sendAiChatMessage(
    sessionId: string,
    message: string,
    onMessage: (chunk: string) => void,
    onDone: () => void,
    onError: (err: string) => void
): AbortController {
    const controller = new AbortController();

    const baseUrl = aiApi.value?.baseUrl || "/userdb-manage";
    const url = `${baseUrl}/userdb/aiChat/chat`;

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({sessionId, message}),
        signal: controller.signal,
    })
        .then(async (response) => {
            if (!response.ok) {
                const text = await response.text();
                onError(text || `请求失败: ${response.status}`);
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) {
                onError("无法读取响应流");
                return;
            }

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, {stream: true});

                // 按 \n 分割，逐行处理 SSE 格式
                const lines = buffer.split("\n");
                // 最后一行可能不完整，保留到下次
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;

                    // 处理 event:done 标记
                    if (trimmed.startsWith("event:done")) {
                        onDone();
                        return;
                    }

                    if (trimmed.startsWith("data:")) {
                        const data = trimmed.substring(5).trim();
                        if (data === "[DONE]") {
                            onDone();
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                onMessage(parsed.content);
                            }
                            if (parsed.error) {
                                onError(parsed.error);
                                return;
                            }
                        } catch {
                            // 非 JSON，直接作为文本内容
                            if (data && data !== "[DONE]") {
                                onMessage(data);
                            }
                        }
                    }
                }
            }

            // 处理 buffer 中剩余的数据
            if (buffer.trim()) {
                const trimmed = buffer.trim();
                if (trimmed.startsWith("data:")) {
                    const data = trimmed.substring(5).trim();
                    if (data === "[DONE]") {
                        onDone();
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            onMessage(parsed.content);
                        }
                    } catch {
                        if (data && data !== "[DONE]") {
                            onMessage(data);
                        }
                    }
                }
            }

            onDone();
        })
        .catch((err) => {
            if (err.name !== "AbortError") {
                onError(err.message || "网络错误");
            }
        });

    return controller;
}

/**
 * 清空 AI 会话
 */
export function clearAiChatSession(sessionId: string): Promise<any> {
    const baseUrl = aiApi.value?.baseUrl || "/userdb-manage";
    return fetch(`${baseUrl}/userdb/aiChat/session/${sessionId}`, {
        method: "DELETE",
    }).then((res) => res.json());
}
