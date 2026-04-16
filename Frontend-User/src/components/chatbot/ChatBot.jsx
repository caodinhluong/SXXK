import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Badge, Typography } from "antd";
import { MessageCircle, X, Minimize2, Maximize2, Send, Bot } from "lucide-react";

const { Text } = Typography;

const defaultQuestions = [
    "Tra cứu tờ khai nhập",
    "Tra cứu tờ khai xuất",
    "Xem tồn kho hiện tại",
    "Tạo định mức sản phẩm",
    "Đối soát nhập hàng",
    "Hướng dẫn sử dụng",
];

const quickReplies = [
    { key: "tk_nhap", label: "Tra TK nhập" },
    { key: "tk_xuat", label: "Tra TK xuất" },
    { key: "ton_kho", label: "Tồn kho" },
    { key: "dinh_muc", label: "Định mức" },
    { key: "doi_soat", label: "Đối soát" },
];

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "bot",
            content: "Xin chào! Tôi là trợ lý ảo của hệ thống hỗ trợ người dùng tạo báo cáo thanh khoản cho các hợp đồng sản xuất xuất khẩu. Tôi có thể giúp bạn:",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

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

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = {
            id: Date.now(),
            type: "user",
            content: inputValue.trim(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");

        setTimeout(() => {
            const botResponse = getBotResponse(userMsg.content);
            setMessages((prev) => [...prev, botResponse]);
        }, 500);
    };

    const handleQuickReply = (key) => {
        const question = quickReplies.find((q) => q.key === key)?.label || "";
        const userMsg = {
            id: Date.now(),
            type: "user",
            content: question,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);

        setTimeout(() => {
            const botResponse = getBotResponse(key);
            setMessages((prev) => [...prev, botResponse]);
        }, 500);
    };

    const getBotResponse = (input) => {
        const lowerInput = input.toLowerCase();
        let content = "";
        let suggestion = null;

        if (lowerInput.includes("tk_nhap") || lowerInput.includes("tra tk nhập")) {
            content = "Để tra cứu tờ khai nhập, bạn vào menu: Tờ khai → Quản lý tờ khai nhập. Tại đây bạn có thể:\n• Xem danh sách tờ khai\n• Tìm kiếm theo số tờ khai, ngày\n• Xem chi tiết từng tờ khai\n• Import từ Excel";
        } else if (lowerInput.includes("tk_xuat") || lowerInput.includes("tra tk xuất")) {
            content = "Để tra cứu tờ khai xuất, bạn vào menu: Tờ khai → Quản lý tờ khai xuất.";
        } else if (lowerInput.includes("ton_kho") || lowerInput.includes("tồn kho")) {
            content = "Để xem tồn kho, bạn vào menu: Kho → Tồn kho. Hiển thị:\n• Tồn kho nguyên phụ liệu\n• Tồn kho sản phẩm\n• Báo cáo tồn kho theo kỳ";
        } else if (lowerInput.includes("dinh_muc") || lowerInput.includes("định mức")) {
            content = "Để quản lý định mức, bạn vào menu: Danh mục → Định mức. Tại đây bạn có thể:\n• Thêm mới định mức\n• Import từ Excel\n• Chỉnh sửa định mức";
        } else if (lowerInput.includes("doi_soat") || lowerInput.includes("đối soát")) {
            content = "Để đối soát, bạn vào menu:\n• Đối soát nhập - Kiểm tra phiếu nhập kho vs tờ khai\n• Đối soát xuất - Kiểm tra phiếu xuất kho vs tờ khai\n• Đối soát định mức - Kiểm tra định mức vs sử dụng";
        } else if (lowerInput.includes("hướng dẫn") || lowerInput.includes("help")) {
            content = "Hướng sử dụng:\n1. Đăng nhập bằng tài khoản doanh nghiệp\n2. Vào Danh mục để nhập SP, NPL, định mức\n3. Vào Hợp đồng để tạo hợp đồng\n4. Vào Tờ khai để khai báo\n5. Vào Kho để nhập/xuất hàng\n6. Vào Đối soát để đối chiếu";
        } else {
            content = "Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Bạn có thể:\n• Chọn các câu hỏi nhanh bên dưới\n• Liên hệsupport để được hỗ trợ";
        }

        return {
            id: Date.now(),
            type: "bot",
            content,
            timestamp: new Date(),
        };
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
                    className="chatbot-window"
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
                                                : "var(--gray-1, #f5f5f5)",
                                        color: msg.type === "user" ? "#fff" : "var(--text-primary, #333)",
                                        whiteSpace: "pre-wrap",
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    <div
                        style={{
                            padding: "8px 12px",
                            borderTop: "1px solid var(--border-color, #e5e5e5)",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                        }}
                    >
                        {quickReplies.map((q, index) => {
                            const colors = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"];
                            return (
                                <Button
                                    key={q.key}
                                    size="small"
                                    onClick={() => handleQuickReply(q.key)}
                                    style={{
                                        fontSize: 12,
                                        background: colors[index % colors.length],
                                        borderColor: colors[index % colors.length],
                                        color: "#fff",
                                    }}
                                >
                                    {q.label}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            padding: "12px",
                            borderTop: "1px solid var(--border-color, #e5e5e5)",
                            display: "flex",
                            gap: 8,
                        }}
                    >
                        <Input
                            ref={inputRef}
                            placeholder="Nhập tin nhắn..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{ flex: 1 }}
                        />
                        <Button type="primary" icon={<Send size={16} />} onClick={handleSend} />
                    </div>
                </div>
            )}

            {/* Chat Button */}
            <Badge dot>
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