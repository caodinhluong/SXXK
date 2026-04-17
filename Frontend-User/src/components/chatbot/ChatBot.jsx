import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input, Button, Badge, Typography, Spin } from "antd";
import { MessageCircle, X, Minimize2, Maximize2, Send, Bot, RotateCcw } from "lucide-react";
import { createSession, streamAnswer } from "../../services/chatbotApi";

const { Text } = Typography;


const WELCOME_MSG = {
    id: "welcome",
    type: "bot",
    content:
        "Xin chào! Tôi là trợ lý ảo giúp bạn sử dụng phần mềm Quản lý Xuất Nhập Khẩu (SXXK). Hãy đặt câu hỏi về bất kỳ tính năng nào bạn cần hỗ trợ.",
    timestamp: new Date(),
};

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Cleanup abort on unmount
    useEffect(() => () => abortRef.current?.(), []);

    const ensureSession = useCallback(async (question) => {
        if (sessionId) return sessionId;
        const session = await createSession(question.slice(0, 80));
        setSessionId(session.id);
        return session.id;
    }, [sessionId]);

    const appendBotStreaming = (id) => {
        setMessages((prev) => [
            ...prev,
            { id, type: "bot", content: "", streaming: true, timestamp: new Date() },
        ]);
    };

    const appendChunk = (id, chunk) => {
        setMessages((prev) =>
            prev.map((m) => m.id === id ? { ...m, content: m.content + chunk } : m)
        );
    };

    const finalizeBot = (id) => {
        setMessages((prev) =>
            prev.map((m) => m.id === id ? { ...m, streaming: false } : m)
        );
    };

    const appendError = (id, errorText) => {
        setMessages((prev) =>
            prev.map((m) =>
                m.id === id
                    ? { ...m, content: errorText || "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.", streaming: false, isError: true }
                    : m
            )
        );
    };

    const sendQuestion = useCallback(async (question) => {
        if (!question.trim() || isStreaming) return;

        const userMsg = {
            id: `user-${Date.now()}`,
            type: "user",
            content: question.trim(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsStreaming(true);

        const botId = `bot-${Date.now()}`;
        appendBotStreaming(botId);

        try {
            const sid = await ensureSession(question);

            abortRef.current?.(); // cancel previous if any
            abortRef.current = streamAnswer(sid, question.trim(), {
                onChunk: (chunk) => appendChunk(botId, chunk),
                onDone: () => {
                    finalizeBot(botId);
                    setIsStreaming(false);
                },
                onError: (msg) => {
                    appendError(botId, msg);
                    setIsStreaming(false);
                },
            });
        } catch (err) {
            appendError(botId, `Không thể kết nối đến chatbot: ${err.message}`);
            setIsStreaming(false);
        }
    }, [isStreaming, ensureSession]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const q = inputValue.trim();
        setInputValue("");
        sendQuestion(q);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 80,
                        right: 24,
                        width: isMaximized ? "calc(100vw - 48px)" : "380px",
                        height: isMaximized ? "calc(100vh - 180px)" : "500px",
                        maxWidth: "100%",
                        maxHeight: "calc(100vh - 180px)",
                        background: "var(--card-bg, #fff)",
                        borderRadius: 12,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Bot size={20} />
                            <Text strong style={{ color: "#fff" }}>Trợ lý ảo SXXK</Text>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                            <Button
                                type="text"
                                size="small"
                                icon={<RotateCcw size={16} />}
                                onClick={() => {
                                    abortRef.current?.();
                                    setMessages([WELCOME_MSG]);
                                    setSessionId(null);
                                    setIsStreaming(false);
                                    setInputValue("");
                                }}
                                style={{ color: "#fff" }}
                                title="Cuộc hội thoại mới"
                            />
                            <Button
                                type="text"
                                size="small"
                                icon={isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                onClick={() => setIsMaximized(!isMaximized)}
                                style={{ color: "#fff" }}
                            />
                            <Button
                                type="text"
                                size="small"
                                icon={<X size={16} />}
                                onClick={() => setIsOpen(false)}
                                style={{ color: "#fff" }}
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflow: "auto",
                            padding: 16,
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    display: "flex",
                                    justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                                }}
                            >
                                <div
                                                    style={{
                                        maxWidth: "80%",
                                        padding: "10px 14px",
                                        borderRadius: 12,
                                        background:
                                            msg.type === "user"
                                                ? "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)"
                                                : msg.isError
                                                ? "#fff2f0"
                                                : "var(--gray-1, #f5f5f5)",
                                        color:
                                            msg.type === "user"
                                                ? "#fff"
                                                : msg.isError
                                                ? "#cf1322"
                                                : "var(--text-primary, #333)",
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {msg.type === "user" ? (
                                        <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                                    ) : (
                                        <div className="md-body">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                            {msg.streaming && (
                                                <Spin size="small" style={{ marginLeft: 4 }} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>


                    {/* Input */}
                    <div
                        style={{
                            padding: "12px",
                            borderTop: "1px solid var(--border-color, #e5e5e5)",
                            display: "flex",
                            gap: 8,
                            flexShrink: 0,
                        }}
                    >
                        <Input
                            ref={inputRef}
                            placeholder="Nhập câu hỏi..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isStreaming}
                            style={{ flex: 1 }}
                        />
                        <Button
                            type="primary"
                            icon={<Send size={16} />}
                            onClick={handleSend}
                            disabled={isStreaming || !inputValue.trim()}
                            loading={isStreaming}
                        />
                    </div>
                </div>
            )}

            {/* Floating button */}
            <Badge dot={!isOpen}>
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<MessageCircle size={24} />}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        position: "fixed",
                        bottom: 16,
                        right: 16,
                        width: 56,
                        height: 56,
                        boxShadow: "0 4px 16px rgba(37, 99, 235, 0.4)",
                        zIndex: 9998,
                    }}
                />
            </Badge>
        </>
    );
};

export default ChatBot;
