
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../../utils/axios";
// import { useAuth } from "../../utils/authContext";

// // Import AddMemory and Icons
// import AddMemory from "../../components/DashboardComponents/AddMemory"; 
// import { PlusCircle, X } from "lucide-react"; 

// import AddMemberCard from "../../components/family/AddMemberForm";
// import AddRootMemberCard from "../../components/family/AddRootMemberForm";
// import UpdateFamilyForm from "../../components/family/UpdateFamily";
// import RemoveFamilyMembersCard from "../../components/family/RemoveMember";
// import DeleteFamilyCard from "../../components/family/DeleteFamilyCard";

// import {
//   Heart,
//   MessageCircle,
//   Share2,
//   Bookmark,
//   MoreVertical,
//   ChevronLeft,
//   ChevronRight,
//   Volume2,
//   Film,
//   Image as ImageIcon,
//   FileText,
//   Clock,
//   Send,
//   Crown,
//   Users,
//   Calendar,
//   Key,
//   Home,
//   UserPlus,
//   UserCog,
//   Settings,
//   Trash2
// } from "lucide-react";

// // Custom hook for family data management
// const useFamilyData = (familyId) => {
//   const [familyDetails, setFamilyDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   // Fetch family details
//   const fetchFamilyDetails = useCallback(async () => {
//     try {
//       const res = await api.get(`/family/${familyId}`);
//       setFamilyDetails(res.data.data);
//     } catch (err) {
//       console.error("Error fetching family details:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, [familyId]);

//   // Trigger refresh of all data
//   const refreshAllData = useCallback(() => {
//     setRefreshTrigger(prev => prev + 1);
//     fetchFamilyDetails();
//   }, [fetchFamilyDetails]);

//   return {
//     familyDetails,
//     setFamilyDetails,
//     loading,
//     setLoading,
//     refreshTrigger,
//     refreshAllData,
//     fetchFamilyDetails
//   };
// };

// export default function OwnerFamilyPage() {
//   const { auth } = useAuth();
//   const user = auth?.user;
//   const currentUserUserId = user?.user_id;
//   const navigate = useNavigate();
//   const { familyId } = useParams();

//   // Use the custom hook for family data management
//   const {
//     familyDetails,
//     loading,
//     refreshAllData,
//     fetchFamilyDetails,
//     refreshTrigger // ADD THIS - it was missing
//   } = useFamilyData(familyId);

//   const [selectedComponentName, setSelectedComponentName] = useState("Overview");
//   const [showAddMemoryPopup, setShowAddMemoryPopup] = useState(false);

//   // Infinite scroll states for Overview
//   const [stories, setStories] = useState([]);
//   const [page, setPage] = useState(1);
//   const [storiesLoading, setStoriesLoading] = useState(true);
//   const [hasMore, setHasMore] = useState(true);
//   const [initialLoadError, setInitialLoadError] = useState(null);
//   const [sortMode, setSortMode] = useState("desc");

//   // Fetch stories with infinite scroll
//   const fetchStories = useCallback(async () => {
//     if (!hasMore && page > 1) return;

//     setStoriesLoading(true); 
//     try {
//       const res = await api.get(`/content/family/${familyId}/${sortMode}?page=${page}`);
//       const newStories = res?.data?.data?.stories || [];

//       setStories(prev => {
//         if (page === 1) return newStories;
//         const newStoryIds = new Set(prev.map(s => s._id));
//         const filteredNewStories = newStories.filter(s => !newStoryIds.has(s._id));
//         return [...prev, ...filteredNewStories];
//       });

//       setHasMore(newStories.length > 0);

//       if (page === 1 && newStories.length === 0) {
//         setInitialLoadError("No stories yet. Start preserving your memories!");
//       } else {
//         setInitialLoadError(null);
//       }

//     } catch (err) {
//       console.error("Story Feed Fetch Error:", err);
//       if (page === 1) {
//         setInitialLoadError("Failed to load stories. Please check your network or try again.");
//       }
//     } finally {
//       setStoriesLoading(false);
//     }
//   }, [page, hasMore, familyId, sortMode]);

//   // Enhanced reset function that also refreshes family data
//   const resetAndFetchStories = useCallback(() => {
//     setStories([]);
//     setPage(1);
//     setHasMore(true);
//     setStoriesLoading(true);
//     fetchStories();
//     // Also refresh family details to get updated member count, etc.
//     fetchFamilyDetails();
//   }, [fetchStories, fetchFamilyDetails]);

//   // Enhanced function to refresh everything
//   const refreshEverything = useCallback(() => {
//     refreshAllData(); // Refresh family details
//     resetAndFetchStories(); // Refresh stories
//   }, [refreshAllData, resetAndFetchStories]);

//   // Scroll handler
//   const handleInfiniteScroll = useCallback(() => {
//     if (storiesLoading || !hasMore || showAddMemoryPopup) return; 
//     const isBottom = (window.innerHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight;
//     if (isBottom) {
//       setPage(prev => prev + 1);
//     }
//   }, [storiesLoading, hasMore, showAddMemoryPopup]);

//   // Initial family detail fetch
//   useEffect(() => {
//     if (!familyId) return;
//     fetchFamilyDetails();
//   }, [familyId, fetchFamilyDetails]);

//   // Data Fetch Effect for stories - ADD refreshTrigger dependency
//   useEffect(() => {
//     if (selectedComponentName === "Overview" || page > 1) {
//       fetchStories();
//     }
//   }, [fetchStories, selectedComponentName, page, refreshTrigger]);

//   // Effect for sorting/page reset
//   useEffect(() => {
//     if (selectedComponentName === "Overview") {
//       setStories([]);
//       setPage(1);
//       setHasMore(true);
//     }
//   }, [sortMode, selectedComponentName, refreshTrigger]);

//   // Scroll Listener Effect
//   useEffect(() => {
//     if (selectedComponentName === "Overview") {
//       window.addEventListener("scroll", handleInfiniteScroll);
//       return () => window.removeEventListener("scroll", handleInfiniteScroll);
//     }
//   }, [handleInfiniteScroll, selectedComponentName]);

//   const groupByYear = (stories) => {
//     const groups = {};
//     stories.forEach((story) => {
//       const date = new Date(story.memory_date || story.createdAt);
//       const year = date.getFullYear();
//       if (!groups[year]) groups[year] = [];
//       groups[year].push(story);
//     });
//     return groups;
//   };

//   const groupedStories = useMemo(() => groupByYear(stories), [stories]);

//   if (loading) {
//     return <div className="p-8 text-center">Loading family details...</div>;
//   }

//   if (!familyDetails) {
//     return <div className="p-8 text-center text-red-500">Family not found.</div>;
//   }

//   // Dashboard menu with icons
//   const menuItems = [
//     { 
//       name: "Overview", 
//       component: <OverviewComponent 
//         stories={stories} 
//         groupedStories={groupedStories} 
//         sortMode={sortMode}
//         setSortMode={setSortMode}
//         storiesLoading={storiesLoading}
//         hasMore={hasMore}
//         initialLoadError={initialLoadError}
//         familyName={familyDetails.family_name}
//         currentUserId={currentUserUserId}
//       />,
//       icon: <Home size={18} />
//     },
//     { name: "Add Memory", isModal: true, icon: <PlusCircle size={18} /> },
//     { 
//       name: "Add New Member", 
//       component: <AddMemberCard 
//         familyId={familyId} 
//         onSuccess={refreshEverything}
//       />, 
//       icon: <UserPlus size={18} /> 
//     },
//     { 
//       name: "Add Root Member", 
//       component: <AddRootMemberCard 
//         familyId={familyId} 
//         onSuccess={refreshEverything}
//       />, 
//       icon: <UserCog size={18} /> 
//     },
//     { 
//       name: "Update Family", 
//       component: <UpdateFamilyForm 
//         familyId={familyId} 
//         onSuccess={refreshEverything}
//       />, 
//       icon: <Settings size={18} /> 
//     },
//     { 
//       name: "Manage Members", 
//       component: <RemoveFamilyMembersCard 
//         familyId={familyId} 
//         onSuccess={refreshEverything}
//       />, 
//       icon: <Users size={18} /> 
//     },
//     { 
//       name: "Delete Family", 
//       component: <DeleteFamilyCard 
//         familyId={familyId} 
//         onSuccess={() => navigate('/dashboard')}
//       />, 
//       icon: <Trash2 size={18} /> 
//     },
//   ];

//   // Handle menu item click
//   const handleMenuItemClick = (item) => {
//     if (item.isModal) {
//       setShowAddMemoryPopup(true);
//     } else {
//       setSelectedComponentName(item.name);
//       setShowAddMemoryPopup(false);
//     }
//   };

//   const selectedComponent = menuItems.find(
//     (item) => item.name === selectedComponentName
//   )?.component;

//   const { family_name, familyPhoto, maleRoot, femaleRoot, invitation_code, marriage_date, memberships } = familyDetails;

//   return (
//     <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
//       {/* LEFT SIDE — Main Content */}
//       <div className="flex-1 p-4 md:p-6 overflow-y-auto">
//         {selectedComponent}
//       </div>

//       {/* RIGHT SIDE — Compact Family Info & Management Options */}
//       <aside className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 shadow-md lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
//         {/* Family Header */}
//         <div className="text-center mb-6">
//           <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-purple-500 shadow-md mb-3">
//             <img
//               src={familyPhoto || "https://via.placeholder.com/150"}
//               alt={family_name}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <h2 className="text-xl font-bold text-purple-700 mb-1">
//             {family_name}
//           </h2>
//           <p className="text-gray-500 text-sm">Family Management</p>
//         </div>

//         {/* Family Details - Compact Grid */}
//         <div className="space-y-4 mb-6">
//           {/* Male Root */}
//           <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
//             <div className="flex-shrink-0">
//               <Crown size={16} className="text-purple-600" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-xs font-semibold text-purple-600 mb-1">Male Root</p>
//               {maleRoot ? (
//                 <div className="flex items-center gap-2">
//                   <img
//                     src={maleRoot.profilePhoto}
//                     alt={maleRoot.fullname}
//                     className="w-6 h-6 rounded-full object-cover"
//                   />
//                   <span className="text-sm text-gray-700 truncate">{maleRoot.fullname}</span>
//                 </div>
//               ) : (
//                 <span className="text-sm text-gray-500">N/A</span>
//               )}
//             </div>
//           </div>

//           {/* Female Root */}
//           <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
//             <div className="flex-shrink-0">
//               <Crown size={16} className="text-pink-600" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-xs font-semibold text-pink-600 mb-1">Female Root</p>
//               {femaleRoot ? (
//                 <div className="flex items-center gap-2">
//                   <img
//                     src={femaleRoot.profilePhoto}
//                     alt={femaleRoot.fullname}
//                     className="w-6 h-6 rounded-full object-cover"
//                   />
//                   <span className="text-sm text-gray-700 truncate">{femaleRoot.fullname}</span>
//                 </div>
//               ) : (
//                 <span className="text-sm text-gray-500">N/A</span>
//               )}
//             </div>
//           </div>

//           {/* Marriage Date */}
//           <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
//             <div className="flex-shrink-0">
//               <Calendar size={16} className="text-blue-600" />
//             </div>
//             <div className="flex-1">
//               <p className="text-xs font-semibold text-blue-600 mb-1">Marriage Date</p>
//               <p className="text-sm text-gray-700">
//                 {marriage_date ? new Date(marriage_date).toLocaleDateString() : "N/A"}
//               </p>
//             </div>
//           </div>

//           {/* Invitation Code */}
//           <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
//             <div className="flex-shrink-0">
//               <Key size={16} className="text-green-600" />
//             </div>
//             <div className="flex-1">
//               <p className="text-xs font-semibold text-green-600 mb-1">Invitation Code</p>
//               <p className="text-sm font-mono text-purple-600 bg-white px-2 py-1 rounded border">
//                 {invitation_code}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Members Section */}
//         {memberships && memberships.length > 0 && (
//           <div className="mb-6">
//             <div className="flex items-center gap-2 mb-3">
//               <Users size={16} className="text-gray-600" />
//               <h3 className="font-semibold text-gray-700 text-sm">Family Members</h3>
//               <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
//                 {memberships.length}
//               </span>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               {memberships.slice(0, 6).map((m) => (
//                 <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
//                   <img
//                     src={m.user.profilePhoto || "https://via.placeholder.com/40"}
//                     alt={m.user.fullname}
//                     className="w-6 h-6 rounded-full object-cover flex-shrink-0"
//                   />
//                   <span className="text-xs text-gray-700 truncate">{m.user.fullname}</span>
//                 </div>
//               ))}
//               {memberships.length > 6 && (
//                 <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
//                   <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center">
//                     <span className="text-xs font-semibold text-purple-600">+{memberships.length - 6}</span>
//                   </div>
//                   <span className="text-xs text-purple-600">More members</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Management Options */}
//         <div className="border-t pt-4 border-gray-200">
//           <h3 className="font-semibold text-gray-700 text-sm mb-3">Manage Family</h3>
//           <nav className="space-y-2">
//             {menuItems.map((item) => {
//               const isActive = selectedComponentName === item.name;
//               // Highlight 'Add Memory' as a primary action button
//               const isActionButton = item.name === "Add Memory";

//               const buttonClasses = isActionButton
//                 ? "w-full flex items-center justify-center gap-3 p-3 rounded-lg transition-all duration-200 text-left bg-green-600 text-white hover:bg-green-700 shadow-md"
//                 : isActive
//                 ? "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-md"
//                 : "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left text-gray-700 hover:bg-purple-50 border border-gray-100";

//               return (
//                 <button
//                   key={item.name}
//                   onClick={() => handleMenuItemClick(item)}
//                   className={buttonClasses}
//                 >
//                   <div className={`${isActionButton || isActive ? "text-white" : "text-purple-600"}`}>
//                     {item.icon}
//                   </div>
//                   <span className={`font-semibold text-sm ${isActionButton || isActive ? "text-white" : "text-gray-800"}`}>
//                     {item.name}
//                   </span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </aside>

//       {/* --- ADD MEMORY MODAL POPUP --- */}
//       {showAddMemoryPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
//           <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
//             {/* Header/Close Button */}
//             <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-[10001] rounded-t-xl">
//               <h3 className="text-xl font-bold text-purple-700">Add New Family Memory</h3>
//               <button 
//                 onClick={() => setShowAddMemoryPopup(false)} // Close modal
//                 className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             {/* AddMemory Component passed with necessary props */}
//             <div className="p-4">
//               <AddMemory 
//                 familyId={familyId} 
//                 onClose={() => setShowAddMemoryPopup(false)}
//                 // Close modal, switch view to Overview, and trigger story list refresh
//                 onMemoryAdded={() => {
//                   setShowAddMemoryPopup(false); 
//                   setSelectedComponentName("Overview"); 
//                   refreshEverything(); // Use the enhanced refresh function
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                           OVERVIEW COMPONENT                               */
// /* -------------------------------------------------------------------------- */
// const OverviewComponent = React.memo(({ 
//   stories, 
//   groupedStories, 
//   sortMode, 
//   setSortMode, 
//   storiesLoading, 
//   hasMore, 
//   initialLoadError, 
//   familyName, 
//   currentUserId 
// }) => {
//   const {familyId} = useParams();
//   const navigate = useNavigate();

//   if (storiesLoading && stories.length === 0 && initialLoadError === null) {
//     return (
//       <div className="text-center py-20 text-xl font-semibold text-purple-600">
//         Loading your family stories...
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6 overflow-y-auto">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
//         <h2 className="text-2xl font-bold text-gray-900">Family Beautiful Memories</h2>

//         <div className="flex gap-3">
//           <button
//             className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${sortMode === "desc"
//                 ? "bg-purple-600 text-white"
//                 : "bg-gray-200 text-gray-800"
//               } hover:bg-purple-100`}
//             onClick={() => setSortMode("desc")}
//           >
//             Show by Recent
//           </button>
//           <button
//             className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${sortMode === "asc"
//                 ? "bg-purple-600 text-white"
//                 : "bg-gray-200 text-gray-800"
//               } hover:bg-purple-100`}
//             onClick={() => setSortMode("asc")}
//           >
//             Show by Memory Date
//           </button>

//           <button
//             onClick={() => navigate(`/family/${familyId}/search`)}
//             className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             Search Stories
//           </button>
//         </div>
//       </div>

//       {/* TIMELINE */}
//       {Object.keys(groupedStories).length === 0 ? (
//         <p className="text-gray-600 text-center mt-10">
//           {initialLoadError || `No memories found for ${familyName}.`}
//         </p>
//       ) : (
//         <div className="max-w-3xl mx-auto">
//           {Object.entries(groupedStories)
//             .sort((a, b) => (sortMode === "asc" ? a[0] - b[0] : b[0] - a[0]))
//             .map(([year, yearStories]) => (
//               <div key={year} className="mb-8">
//                 <h3 className="text-xl font-semibold mb-4 border-l-4 border-purple-500 pl-3 text-gray-800">
//                   {year}
//                 </h3>
//                 <div className="space-y-4">
//                   {yearStories.map((story) => (
//                     <StoryCard
//                       key={story._id}
//                       story={story}
//                       currentUserId={currentUserId}
//                       familyName={familyName}
//                     />
//                   ))}
//                 </div>
//               </div>
//             ))}
//         </div>
//       )}

//       {/* Loading indicator for subsequent pages */}
//       {storiesLoading && hasMore && stories.length > 0 && (
//         <div className="text-center py-4 text-purple-600 font-bold mt-4">
//           Loading more memories...
//         </div>
//       )}

//       {/* End of content message */}
//       {!hasMore && stories.length > 0 && (
//         <div className="text-center py-8 text-gray-500 border-t border-purple-200 mt-6">
//           You've reached the end of the timeline! 🎉
//         </div>
//       )}
//     </div>
//   );
// });

// /* -------------------------------------------------------------------------- */
// /*                         STORY CARD (SMALLER VERSION)                       */
// /* -------------------------------------------------------------------------- */
// const StoryCard = React.memo(({ story, currentUserId, familyName }) => {
//   const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
//   const [likes, setLikes] = useState(story.liked_by.length);
//   const [isLiked, setIsLiked] = useState(story.liked_by.includes(currentUserId));

//   const currentMedia = story.media[currentMediaIndex];
//   const totalMedia = story.media.length;

//   const uploader = story.uploaded_by || {
//     fullname: "Unknown User",
//     username: "unknown_user",
//     profilePhoto: "https://via.placeholder.com/40" 
//   };

//   const timeAgo = useMemo(() => {
//     const diff = Date.now() - new Date(story.createdAt).getTime();
//     const minutes = Math.floor(diff / (1000 * 60));
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);

//     if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
//     if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
//     return `less than a minute ago`;
//   }, [story.createdAt]);

//   const handleLikeToggle = async (e) => {
//     e.preventDefault();
//     if (!currentUserId) return;

//     const endpoint = isLiked ? `/unlike/${story._id}` : `/like/${story._id}`;

//     setIsLiked(prev => !prev);
//     setLikes(prev => prev + (isLiked ? -1 : 1));

//     try {
//       await api.post(endpoint); 
//     } catch (err) {
//       console.error("Like toggle failed:", err);
//       setIsLiked(prev => !prev);
//       setLikes(prev => prev - (isLiked ? -1 : 1));
//     }
//   };

//   const renderMedia = (mediaItem) => {
//     if (!mediaItem) return null;
//     switch (mediaItem.type) {
//       case "image":
//         return <img src={mediaItem.url} alt="Story Media" className="w-full h-full object-cover" />;
//       case "video":
//         return (
//           <div className="relative w-full h-full bg-black">
//             <video 
//               src={mediaItem.url} 
//               className="w-full h-full object-contain"
//               controls 
//               poster={mediaItem.thumbnailUrl}
//             />
//           </div>
//         );
//       case "audio":
//         return (
//           <div className="flex flex-col items-center justify-center min-h-[150px] bg-purple-100/50 rounded-lg p-4 border border-purple-200">
//             <Volume2 size={32} className="text-purple-600 mb-3"/>
//             <p className="text-gray-700 font-medium mb-2">Audio Memory</p>
//             <audio controls className="w-full max-w-xs">
//               <source src={mediaItem.url} type="audio/mp3" />
//               Your browser does not support the audio element.
//             </audio>
//           </div>
//         );
//       case "text":
//         return <div className="p-6 bg-purple-50 min-h-[200px] flex flex-col justify-center rounded-lg text-gray-700 border border-purple-200">
//           <p className="font-medium text-lg mb-2 whitespace-pre-wrap leading-relaxed">{mediaItem.text}</p>
//           <FileText size={20} className="text-purple-400 mt-4 self-end" />
//         </div>;
//       default:
//         return null;
//     }
//   };

//   const goToNext = (e) => {
//     e.preventDefault();
//     setCurrentMediaIndex(prev => (prev + 1) % totalMedia);
//   };

//   const goToPrev = (e) => {
//     e.preventDefault();
//     setCurrentMediaIndex(prev => (prev - 1 + totalMedia) % totalMedia);
//   };

//   const cleanedTags = (story.tags || []).map(tag => tag.replace(/[\[\]"]/g, '')).filter(t => t.length > 0);

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 mb-6 w-full transition-shadow duration-300 hover:shadow-xl">

//       {/* Header */}
//       <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-100">
//         <div className="flex items-center">
//           <img src={uploader.profilePhoto || "https://via.placeholder.com/40"} alt={uploader.fullname} className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-purple-400" />
//           <div className="flex flex-col">
//             <p className="font-semibold text-lg text-gray-800 hover:text-purple-600 transition-colors cursor-pointer">{uploader.fullname}</p>
//             <p className="text-xs text-gray-500 flex items-center">
//               @{uploader.username} • <Clock size={12} className="ml-1 mr-1"/> {timeAgo} • {familyName}
//             </p>
//           </div>
//         </div>
//         <MoreVertical size={20} className="text-gray-500 hover:text-purple-600 cursor-pointer transition-colors" />
//       </div>

//       {/* Title & Caption */}
//       <div className="mb-4">
//         <h3 className="text-xl font-bold text-purple-700 mb-2 flex items-center space-x-2">
//           <div className="flex-shrink-0 text-purple-500">
//             {currentMedia?.type === 'image' && <ImageIcon size={20} />}
//             {currentMedia?.type === 'video' && <Film size={20} />}
//             {currentMedia?.type === 'audio' && <Volume2 size={20} />}
//             {currentMedia?.type === 'text' && <FileText size={20} />}
//           </div>
//           <span>{story.title}</span>
//         </h3>
//         <p className="text-gray-600 text-base leading-relaxed">{story.caption}</p>
//       </div>

//       {/* Media/Content Area */}
//       <div className="mb-4">
//         <div className={`relative w-full ${currentMedia?.type !== 'text' && currentMedia?.type !== 'audio' ? 'aspect-video' : ''} rounded-lg overflow-hidden shadow-inner bg-gray-100/50`}>
//           {renderMedia(currentMedia)}

//           {/* Carousel Controls */}
//           {totalMedia > 1 && (
//             <>
//               <button
//                 onClick={goToPrev}
//                 className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-all z-10 opacity-90 disabled:opacity-30"
//                 disabled={currentMediaIndex === 0}
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 onClick={goToNext}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-all z-10 opacity-90 disabled:opacity-30"
//                 disabled={currentMediaIndex === totalMedia - 1}
//               >
//                 <ChevronRight size={20} />
//               </button>
//               <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-bold z-10">
//                 {currentMediaIndex + 1} of {totalMedia}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Tags */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         {cleanedTags.map((tag, i) => (
//           <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer">
//             #{tag}
//           </span>
//         ))}
//       </div>

//       {/* Actions */}
//       <div className="flex items-center justify-between border-t pt-4 border-gray-100">
//         <div className="flex space-x-6">
//           <button onClick={handleLikeToggle} className={`flex items-center font-semibold text-sm transition-colors transform hover:scale-105 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}>
//             <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className="mr-1" /> {likes} Likes
//           </button>
//           <button className="flex items-center text-gray-500 hover:text-purple-600 transition-colors font-semibold text-sm transform hover:scale-105">
//             <MessageCircle size={18} className="mr-1" /> 0 Comments
//           </button>
//           <button className="flex items-center text-gray-500 hover:text-purple-600 transition-colors font-semibold text-sm transform hover:scale-105">
//             <Send size={18} className="mr-1" /> Share
//           </button>
//         </div>
//         <Bookmark size={18} className="text-gray-500 hover:text-purple-600 cursor-pointer transition-colors" />
//       </div>
//     </div>
//   );
// });

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axios";
import { useAuth } from "../../utils/authContext";

import AddMemory from "../../components/DashboardComponents/AddMemory";
import AddMemberCard from "../../components/family/AddMemberForm";
import AddRootMemberCard from "../../components/family/AddRootMemberForm";
import UpdateFamilyForm from "../../components/family/UpdateFamily";
import RemoveFamilyMembersCard from "../../components/family/RemoveMember";
import DeleteFamilyCard from "../../components/family/DeleteFamilyCard";

import {
  Heart, MessageCircle, Bookmark, MoreVertical,
  ChevronLeft, ChevronRight, Volume2, Film,
  Image as ImageIcon, FileText, Clock, Send,
  Crown, Users, Calendar, Key, Home, UserPlus,
  UserCog, Settings, Trash2, PlusCircle, X,
  Copy, Check, Search,
} from "lucide-react";

// ─── Custom hook for family data ──────────────────────────────────────────────
const useFamilyData = (familyId) => {
  const [familyDetails, setFamilyDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFamilyDetails = useCallback(async () => {
    try {
      const res = await api.get(`/family/${familyId}`);
      setFamilyDetails(res.data.data);
    } catch (err) {
      console.error("Error fetching family details:", err);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  return { familyDetails, loading, fetchFamilyDetails };
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OwnerFamilyPage() {
  const { auth } = useAuth();
  const user = auth?.user;
  const currentUserUserId = user?.user_id;
  const navigate = useNavigate();
  const { familyId } = useParams();

  const { familyDetails, loading, fetchFamilyDetails } = useFamilyData(familyId);
  const [activePanel, setActivePanel] = useState("overview"); // overview | add-memory | add-member | add-root | update | manage | delete
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Stories state
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState(null);
  const [sortMode, setSortMode] = useState("desc");

  const fetchStories = useCallback(async () => {
    if (!hasMore && page > 1) return;
    setStoriesLoading(true);
    try {
      const res = await api.get(`/content/family/${familyId}/${sortMode}?page=${page}`);
      const newStories = res?.data?.data?.stories || [];
      setStories(prev => {
        if (page === 1) return newStories;
        const ids = new Set(prev.map(s => s._id));
        return [...prev, ...newStories.filter(s => !ids.has(s._id))];
      });
      setHasMore(newStories.length > 0);
      if (page === 1 && newStories.length === 0) setInitialLoadError("No stories yet. Start preserving your memories!");
      else setInitialLoadError(null);
    } catch {
      if (page === 1) setInitialLoadError("Failed to load stories.");
    } finally {
      setStoriesLoading(false);
    }
  }, [page, hasMore, familyId, sortMode]);

  const resetStories = useCallback(() => {
    setStories([]); setPage(1); setHasMore(true); setStoriesLoading(true);
  }, []);

  const refreshAll = useCallback(() => {
    fetchFamilyDetails();
    resetStories();
  }, [fetchFamilyDetails, resetStories]);

  const handleInfiniteScroll = useCallback(() => {
    if (storiesLoading || !hasMore || showAddMemoryModal) return;
    if ((window.innerHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight) {
      setPage(p => p + 1);
    }
  }, [storiesLoading, hasMore, showAddMemoryModal]);

  useEffect(() => { fetchFamilyDetails(); }, [familyId]);
  useEffect(() => { if (activePanel === "overview" || page > 1) fetchStories(); }, [page, sortMode, activePanel]);
  useEffect(() => { if (activePanel === "overview") resetStories(); }, [sortMode]);
  useEffect(() => {
    if (activePanel === "overview") {
      window.addEventListener("scroll", handleInfiniteScroll);
      return () => window.removeEventListener("scroll", handleInfiniteScroll);
    }
  }, [handleInfiniteScroll, activePanel]);

  const groupedStories = useMemo(() => {
    const groups = {};
    stories.forEach(s => {
      const year = new Date(s.memory_date || s.createdAt).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(s);
    });
    return groups;
  }, [stories]);

  const copyCode = () => {
    navigator.clipboard.writeText(familyDetails?.invitation_code || "");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading family...</p>
      </div>
    </div>
  );

  if (!familyDetails) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 font-semibold">Family not found.</p>
    </div>
  );

  const { family_name, familyPhoto, maleRoot, femaleRoot, invitation_code, marriage_date, memberships } = familyDetails;

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "add-member", label: "Invite Member", icon: UserPlus },
    { id: "add-root", label: "Invite Root Member", icon: Crown },
    { id: "update", label: "Edit Family", icon: Settings },
    { id: "manage", label: "Manage Members", icon: Users },
    { id: "delete", label: "Delete Family", icon: Trash2, danger: true },
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case "add-member": return <AddMemberCard familyId={familyId} onSuccess={refreshAll} />;
      case "add-root": return <AddRootMemberCard onSuccess={refreshAll} />;
      case "update": return <UpdateFamilyForm familyId={familyId} onSuccess={refreshAll} />;
      case "manage": return <RemoveFamilyMembersCard familyId={familyId} onSuccess={refreshAll} />;
      case "delete": return <DeleteFamilyCard familyId={familyId} onSuccess={() => navigate("/dashboard")} />;
      default: return (
        <OverviewPanel
          stories={stories}
          groupedStories={groupedStories}
          sortMode={sortMode}
          setSortMode={setSortMode}
          storiesLoading={storiesLoading}
          hasMore={hasMore}
          initialLoadError={initialLoadError}
          familyName={family_name}
          currentUserId={currentUserUserId}
          familyId={familyId}
          onAddMemory={() => setShowAddMemoryModal(true)}
        />
      );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      {/* ── LEFT: Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {renderPanel()}
      </div>

      {/* ── RIGHT: Sidebar ────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-72 bg-white border-l border-gray-100 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto flex-shrink-0">
        {/* Family card */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-purple-200 flex-shrink-0">
              <img src={familyPhoto || "https://via.placeholder.com/56"} alt={family_name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 truncate">{family_name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Family Dashboard</p>
            </div>
          </div>

          {/* Root members row */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-600 flex items-center gap-1 mb-2">
                <Crown size={11} /> Male Root
              </p>
              {maleRoot ? (
                <div className="flex items-center gap-2">
                  <img src={maleRoot.profilePhoto} alt={maleRoot.fullname} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs text-gray-700 truncate">{maleRoot.fullname}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Not set</span>
              )}
            </div>
            <div className="bg-pink-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-pink-600 flex items-center gap-1 mb-2">
                <Crown size={11} /> Female Root
              </p>
              {femaleRoot ? (
                <div className="flex items-center gap-2">
                  <img src={femaleRoot.profilePhoto} alt={femaleRoot.fullname} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs text-gray-700 truncate">{femaleRoot.fullname}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Not set</span>
              )}
            </div>
          </div>

          {/* Marriage date + members count */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mb-1">
                <Calendar size={11} /> Married
              </p>
              <p className="text-xs text-gray-700">
                {marriage_date ? new Date(marriage_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mb-1">
                <Users size={11} /> Members
              </p>
              <p className="text-xs text-gray-700 font-bold">{memberships?.length || 0}</p>
            </div>
          </div>

          {/* Invitation code with copy */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-2">
              <Key size={11} /> Invitation Code
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono font-bold text-purple-700 tracking-widest">
                {invitation_code}
              </code>
              <button
                onClick={copyCode}
                className="p-1.5 rounded-lg hover:bg-purple-100 text-gray-400 hover:text-purple-600 transition-colors"
                title="Copy code"
              >
                {codeCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Members avatars */}
        {memberships && memberships.length > 0 && (
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Family Members</h3>
            <div className="flex flex-wrap gap-2">
              {memberships.slice(0, 8).map((m) => (
                <div key={m.id} title={m.user.fullname} className="relative">
                  <img
                    src={m.user.profilePhoto || "https://via.placeholder.com/32"}
                    alt={m.user.fullname}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
              ))}
              {memberships.length > 8 && (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                  <span className="text-xs font-bold text-purple-600">+{memberships.length - 8}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">Manage</h3>

          {/* Add Memory — standalone CTA */}
          <button
            onClick={() => setShowAddMemoryModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold text-sm mb-2 hover:shadow-md hover:shadow-purple-200 transition-all"
          >
            <PlusCircle size={16} />
            Add Memory
          </button>

          {navItems.map(({ id, label, icon: Icon, danger }) => {
            const isActive = activePanel === id;
            return (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? danger
                    ? "bg-red-500 text-white"
                    : "bg-purple-100 text-purple-700"
                  : danger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Add Memory Modal ───────────────────────────────────────────────── */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Add Family Memory</h3>
              <button
                onClick={() => setShowAddMemoryModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <AddMemory
                familyId={familyId}
                onClose={() => setShowAddMemoryModal(false)}
                onMemoryAdded={() => {
                  setShowAddMemoryModal(false);
                  setActivePanel("overview");
                  refreshAll();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────
const OverviewPanel = React.memo(({
  stories, groupedStories, sortMode, setSortMode,
  storiesLoading, hasMore, initialLoadError,
  familyName, currentUserId, familyId, onAddMemory,
}) => {
  const navigate = useNavigate();

  if (storiesLoading && stories.length === 0 && initialLoadError === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading memories...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Family Memories</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {[["desc", "Recent"], ["asc", "Oldest"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSortMode(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortMode === val ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate(`/family/${familyId}/search`)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Search size={13} /> Search
          </button>
          <button
            onClick={onAddMemory}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white rounded-xl text-xs font-semibold hover:shadow-md transition-all"
          >
            <PlusCircle size={13} /> Add Memory
          </button>
        </div>
      </div>

      {Object.keys(groupedStories).length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={28} className="text-purple-400" />
          </div>
          <p className="text-gray-500 font-medium">{initialLoadError || `No memories for ${familyName} yet.`}</p>
          <button onClick={onAddMemory} className="mt-4 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
            Add First Memory
          </button>
        </div>
      ) : (
        Object.entries(groupedStories)
          .sort((a, b) => sortMode === "asc" ? a[0] - b[0] : b[0] - a[0])
          .map(([year, yearStories]) => (
            <div key={year} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-bold text-gray-800">{year}</span>
                <div className="flex-1 h-px bg-purple-100" />
                <span className="text-xs font-medium text-purple-400">{yearStories.length} memories</span>
              </div>
              <div className="space-y-4">
                {yearStories.map(story => (
                  <StoryCard key={story._id} story={story} currentUserId={currentUserId} familyName={familyName} />
                ))}
              </div>
            </div>
          ))
      )}

      {storiesLoading && hasMore && stories.length > 0 && (
        <div className="text-center py-4 text-purple-500 text-sm font-medium">Loading more...</div>
      )}
      {!hasMore && stories.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border-t border-gray-100 mt-4">
          You've seen all memories 🎉
        </div>
      )}
    </div>
  );
});

// ─── Story Card ───────────────────────────────────────────────────────────────
const StoryCard = React.memo(({ story, currentUserId, familyName }) => {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [likes, setLikes] = useState(story.liked_by.length);
  const [isLiked, setIsLiked] = useState(story.liked_by.includes(currentUserId));

  const media = story.media[mediaIndex];
  const totalMedia = story.media.length;
  const uploader = story.uploaded_by || { fullname: "Unknown", username: "unknown", profilePhoto: null };

  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(story.createdAt).getTime();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return "just now";
  }, [story.createdAt]);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;
    setIsLiked(p => !p);
    setLikes(p => p + (isLiked ? -1 : 1));
    try {
      await api.post(isLiked ? `/unlike/${story._id}` : `/like/${story._id}`);
    } catch {
      setIsLiked(p => !p);
      setLikes(p => p - (isLiked ? -1 : 1));
    }
  };

  const renderMedia = (item) => {
    if (!item) return null;
    switch (item.type) {
      case "image": return <img src={item.url} alt="Memory" className="w-full h-full object-cover" />;
      case "video": return <video src={item.url} className="w-full h-full object-contain" controls poster={item.thumbnailUrl} />;
      case "audio": return (
        <div className="flex flex-col items-center justify-center min-h-[120px] bg-purple-50 p-4">
          <Volume2 size={28} className="text-purple-400 mb-3" />
          <audio controls className="w-full max-w-xs"><source src={item.url} /></audio>
        </div>
      );
      case "text": return (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-fuchsia-50 min-h-[120px] flex items-center">
          <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{item.text}</p>
        </div>
      );
      default: return null;
    }
  };

  const tags = (story.tags || []).map(t => t.replace(/[\[\]"]/g, "")).filter(Boolean);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <img src={uploader.profilePhoto || "https://via.placeholder.com/36"} alt={uploader.fullname} className="w-9 h-9 rounded-full object-cover border border-purple-100" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{uploader.fullname}</p>
            <p className="text-xs text-gray-400">@{uploader.username} · {timeAgo}</p>
          </div>
        </div>
        <MoreVertical size={18} className="text-gray-300 hover:text-gray-500 cursor-pointer" />
      </div>

      {/* Title */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-gray-900">{story.title}</h3>
        {story.caption && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{story.caption}</p>}
      </div>

      {/* Media */}
      {totalMedia > 0 && (
        <div className="relative">
          <div className={`${media?.type !== "text" && media?.type !== "audio" ? "aspect-video" : ""} bg-gray-50`}>
            {renderMedia(media)}
          </div>
          {totalMedia > 1 && (
            <>
              <button onClick={(e) => { e.preventDefault(); setMediaIndex(p => Math.max(0, p - 1)); }} disabled={mediaIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-20 hover:bg-black/70">
                <ChevronLeft size={16} />
              </button>
              <button onClick={(e) => { e.preventDefault(); setMediaIndex(p => Math.min(totalMedia - 1, p + 1)); }} disabled={mediaIndex === totalMedia - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-20 hover:bg-black/70">
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                {mediaIndex + 1}/{totalMedia}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {tags.map((tag, i) => (
            <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-50 mt-3">
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> {likes}
        </button>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-purple-500 transition-colors">
          <MessageCircle size={16} /> Comment
        </button>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-500 transition-colors">
          <Send size={16} /> Share
        </button>
        <Bookmark size={16} className="text-gray-300 hover:text-purple-500 cursor-pointer ml-auto transition-colors" />
      </div>
    </div>
  );
});
