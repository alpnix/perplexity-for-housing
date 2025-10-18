"use client";

import ActionButtons from "@/components/ActionButtons";
import Card from "@/components/Card";
import Tabs from "@/components/Tabs";
import React, { useEffect, useState } from "react";
import { FaUserPlus, FaTimes, FaCheck, FaUndo, FaComments } from "react-icons/fa";
import { useRoommates } from "@/hooks/useRoommates";
import { useFetch } from "@/hooks/useAPiCall";
import useUserStore from "@/store/userStore";
import { Roommate } from "@/types";
import { getRandomColor } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import Image from "next/image";
import { useRouter } from "next/navigation";

type RoommateStatus = "recommended" | "pending" | "accepted" | "chat" | "not-interested";

const getDefaultAvatar = (name: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${getRandomColor()}&color=fff&size=150`;

const Roommates = () => {
  const [activeTab, setActiveTab] = useState<RoommateStatus>("recommended");
  const [isOpenToRoommate, setIsOpenToRoommate] = useState<boolean | null>(null);
  const [checkedPreference, setCheckedPreference] = useState(false);
  const {
    roommates,
    fetchRecommendedRoommates,
    updateRoommateStatus,
    fetchRoommatesByStatus,
    error,
    setRoommates,
  } = useRoommates();
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const {
    matches,
    messages,
    activeMatchId,
    setActiveMatchId,
    fetchMatches,
    sendMessage,
  } = useChat();

  const fetchRoommates = async (status?: RoommateStatus) => {
    try {
      if (isOpenToRoommate === false) {
        setRoommates([]);
        return;
      }
      const tab = status || activeTab;
      if (tab === "recommended") {
        await fetchRecommendedRoommates.mutateAsync(undefined);
      } else if (tab === "chat") {
        // chat tab uses matches, not roommates list
        await fetchMatches.mutateAsync(undefined);
      } else {
        await fetchRoommatesByStatus.mutateAsync(tab as any);
      }
    } catch (err) {
      console.error("Fetch Roommates Error", err);
    }
  };

  useEffect(() => {
    if (!checkedPreference) return;
    if (isOpenToRoommate === false) {
      setRoommates([]);
      return;
    }
    fetchRoommates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, checkedPreference, isOpenToRoommate]);

  // Check user's openToRoommate preference and gate access if false
  useEffect(() => {
    const checkPreference = async () => {
      try {
        const response = await useFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
          "GET",
          null
        );
        const result = await response.json();
        const open = !!result?.data?.tenantProfile?.openToRoommate;
        setIsOpenToRoommate(open);
      } catch (e) {
        // On failure, default to allowing access to avoid blocking incorrectly
        setIsOpenToRoommate(true);
      } finally {
        setCheckedPreference(true);
      }
    };
    checkPreference();
  }, []);

  

  const handleUpdateStatus = async (roommate: Roommate, newStatus: RoommateStatus) => {
    try {
      await updateRoommateStatus.mutateAsync({ targetUserId: roommate.id, newStatus: newStatus as any });

      // Optimistically remove from current list if moving away from current tab
      if (activeTab === "recommended" && (newStatus === "pending" || newStatus === "not-interested")) {
        setRoommates((prev) => prev.filter((r) => r.id !== roommate.id));
        setActiveTab(newStatus);
        await fetchRoommates(newStatus);
        return;
      }

      if (newStatus === "recommended") {
        // Returning to recommended after withdraw/reconsider
        setRoommates((prev) => prev.filter((r) => r.id !== roommate.id));
        try {
          await useFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/roommates/interests/${roommate.id}`,
            "DELETE",
            null
          );
        } catch (e) {
          // Non-blocking; backend also deletes on status update
        }
        setActiveTab("recommended");
        await fetchRoommates("recommended");
        return;
      }

      if (newStatus !== activeTab) {
        setRoommates((prev) => prev.filter((r) => r.id !== roommate.id));
        setActiveTab(newStatus);
        await fetchRoommates(newStatus);
      } else {
        await fetchRoommates();
      }
    } catch (err) {
      console.error("Status Update Error", err);
    }
  };

  const openChatForRoommate = (roommate: Roommate) => {
    setActiveTab("chat");
    const doSelect = () => {
      const match = matches.find((m) => m.otherUser?._id === roommate.id);
      if (match) {
        setActiveMatchId(match.matchId);
        const el = document.getElementById("chat-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    if (!matches.length) {
      fetchMatches.mutateAsync(undefined).then(doSelect);
    } else {
      doSelect();
    }
  };

  const getActionButtons = (roommate: Roommate) => {
    switch (activeTab) {
      case "recommended":
        return [
          {
            label: "Connect",
            icon: <FaUserPlus className="w-5 h-5" />,
            onClick: () => handleUpdateStatus(roommate, "pending"),
            className: "text-green-600 hover:bg-green-50",
          },
          {
            label: "Not Interested",
            icon: <FaTimes className="w-5 h-5" />,
            onClick: () => handleUpdateStatus(roommate, "not-interested"),
            className: "text-red-600 hover:bg-red-50",
          },
        ];
      case "pending":
        return [
          {
            label: "Withdraw Request",
            icon: <FaTimes className="w-5 h-5" />,
            onClick: () => handleUpdateStatus(roommate, "recommended"),
            className: "text-red-600 hover:bg-red-50",
          },
        ];
      case "accepted":
        return [
          {
            label: "Chat",
            icon: <FaComments className="w-5 h-5" />,
            onClick: () => openChatForRoommate(roommate),
            className: "text-blue-600 hover:bg-blue-50",
          },
        ];
      case "not-interested":
        return [
          {
            label: "Reconsider",
            icon: <FaUndo className="w-5 h-5" />,
            onClick: () => handleUpdateStatus(roommate, "recommended"),
            className: "text-yellow-600 hover:bg-yellow-50",
          },
        ];
      default:
        return [];
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const [input, setInput] = useState("");
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      handleSend();
    }
  };
  const handleSend = async () => {
    if (!activeMatchId || !input.trim()) return;
    const content = input.trim();
    setInput("");
    await sendMessage.mutateAsync({ matchId: activeMatchId, content });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Find Your Perfect Roommate</h1>

        <Tabs
          tabs={["recommended", "pending", "accepted", "not-interested", "chat"]}
          activeTab={activeTab}
          onTabClick={(tab) => setActiveTab(tab as RoommateStatus)}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {activeTab !== "chat" ? (
          roommates.length === 0 ? (
            <p>No roommates found for this status.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roommates.map((roommate) => (
                <div
                  key={roommate.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/roommates/${roommate.id}`)}
                >
                  <Card
                    image={roommate.image || getDefaultAvatar(roommate.name)}
                    title={roommate.name}
                    subtitle={`${roommate.location}`}
                    tags={roommate.hobbies}
                  >
                    <ActionButtons buttons={getActionButtons(roommate)} />
                  </Card>
                </div>
              ))}
            </div>
          )
        ) : (
          <div id="chat-section" className="mt-4 flex flex-col lg:flex-row gap-6">
            <aside className="bg-white border rounded-md overflow-hidden w-full lg:w-80 shrink-0">
              <div className="p-4 font-semibold border-b">Chats</div>
              <div className="max-h-[50vh] overflow-y-auto">
                {matches.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No matches yet.</div>
                ) : (
                  matches.map((m) => {
                    const name = m.otherUser ? `${m.otherUser.firstname} ${m.otherUser.lastname}` : "Unknown";
                    const image = m.tenantProfile?.profileImage || m.otherUser?.image || undefined;
                    
                    const isActive = activeMatchId === m.matchId;
                    return (
                      <button
                        key={m.matchId}
                        onClick={() => setActiveMatchId(m.matchId)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${isActive ? "bg-gray-100" : ""}`}
                      >
                        {image ? (
                          <Image src={image} alt={name} width={32} height={32} className="rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300" />
                        )}
                        <div className="truncate">
                          <div className="text-sm font-medium truncate">{name}</div>
                          <div className="text-xs text-gray-500 truncate">{m.tenantProfile?.city?.description || ""}</div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <main className="flex-1 bg-white border rounded-md overflow-hidden flex flex-col">
              {!activeMatchId ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging</div>
              ) : (
                <>
                  <div className="border-b px-4 py-3 font-medium bg-transparent text-black">
                    {matches.find((m) => m.matchId === activeMatchId)?.otherUser ? `${matches.find((m) => m.matchId === activeMatchId)?.otherUser?.firstname} ${matches.find((m) => m.matchId === activeMatchId)?.otherUser?.lastname}` : "Chat"}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500 text-sm">
                          <div className="mb-1 font-medium">You matched!</div>
                          <div>Start this chat to break the ice.</div>
                        </div>
                      </div>
                    ) : messages.map((msg) => {
                      const isMine = msg.sender === user?._id;
                      return (
                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`${
                              isMine
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            } max-w-[70%] rounded-lg px-3 py-2 shadow`}
                          >
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                            <div className={`mt-1 text-[10px] ${isMine ? "text-white/80" : "text-gray-400"} text-right`}>
                              {formatTimestamp(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t p-3 bg-white flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleEnter}
                      placeholder="Type a message"
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button onClick={handleSend} className="px-4 py-2 bg-primary text-white rounded-md">Send</button>
                  </div>
                </>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Blocker modal if user is not open to roommates */}
      {checkedPreference && isOpenToRoommate === false && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Update your roommate preference</h2>
            <p className="text-sm text-gray-600 mb-4">
              You currently have "Open to Roommate" set to off. To view matches and appear on other people's feed,
              please enable it in your profile settings.
            </p>
            <div className="flex justify-end gap-2">
              <a
                href="/profile"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark"
              >
                Go to Profile
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roommates;