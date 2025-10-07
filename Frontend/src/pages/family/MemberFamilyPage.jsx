
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useParams } from "react-router-dom";
// import api from "../../utils/axios";
// import { useAuth } from "../../utils/authContext";
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
// } from "lucide-react";

// export default function MemberFamilyPage() {
//   const { familyId } = useParams();
//   const { auth } = useAuth();
//   const currentUserId = auth?.user?.user_id;

//   const [stories, setStories] = useState([]);
//   const [sortMode, setSortMode] = useState("desc");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [familyDetails, setFamilyDetails] = useState(null);

//   // ✅ Fetch Family Details
//   const fetchFamilyDetails = useCallback(async () => {
//     try {
//       const res = await api.get(`/family/${familyId}`);
//       setFamilyDetails(res.data.data);
//     } catch (err) {
//       console.error("Error fetching family:", err);
//       setError("Failed to load family info.");
//     }
//   }, [familyId]);

//   // ✅ Fetch Family Stories
//   const fetchStories = useCallback(async () => {
//     if (!familyId) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await api.get(`/content/family/${familyId}/${sortMode}`);
//       setStories(res.data.data.stories || []);
//     } catch (err) {
//       console.error("Error fetching stories:", err);
//       setError("Failed to load timeline stories.");
//     } finally {
//       setLoading(false);
//     }
//   }, [familyId, sortMode]);

//   useEffect(() => {
//     fetchFamilyDetails();
//     fetchStories();
//   }, [fetchFamilyDetails, fetchStories]);

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

//   if (loading && !stories.length) {
//     return (
//       <div className="flex justify-center items-center h-64 text-purple-600 text-lg font-medium">
//         Loading memories...
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-center text-red-600 p-6">{error}</div>;
//   }

//   if (!familyDetails) {
//     return <div className="text-center text-gray-600 p-6">Family not found.</div>;
//   }

//   const {
//     family_name,
//     familyPhoto,
//     maleRoot,
//     femaleRoot,
//     invitation_code,
//     marriage_date,
//   } = familyDetails;

//   return (
//     <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
//       {/* LEFT SIDE — Timeline */}
//       <div className="flex-1 p-4 md:p-6 overflow-y-auto">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
//           <h2 className="text-2xl font-bold text-gray-900">Family Timeline</h2>

//           <div className="flex gap-3">
//             <button
//               className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
//                 sortMode === "desc"
//                   ? "bg-purple-600 text-white"
//                   : "bg-gray-200 text-gray-800"
//               } hover:bg-purple-100`}
//               onClick={() => setSortMode("desc")}
//             >
//               Show by Recent
//             </button>
//             <button
//               className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
//                 sortMode === "asc"
//                   ? "bg-purple-600 text-white"
//                   : "bg-gray-200 text-gray-800"
//               } hover:bg-purple-100`}
//               onClick={() => setSortMode("asc")}
//             >
//               Show by Memory Date
//             </button>
//           </div>
//         </div>

//         {/* TIMELINE */}
//         {Object.keys(groupedStories).length === 0 ? (
//           <p className="text-gray-600 text-center mt-10">
//             No memories found for <b>{family_name}</b>.
//           </p>
//         ) : (
//           <div className="max-w-full md:max-w-2xl lg:max-w-3xl mx-auto">
//             {Object.entries(groupedStories)
//               .sort((a, b) => (sortMode === "asc" ? a[0] - b[0] : b[0] - a[0]))
//               .map(([year, yearStories]) => (
//                 <div key={year} className="mb-10">
//                   <h3 className="text-xl font-semibold mb-4 border-l-4 border-purple-500 pl-3 text-gray-800">
//                     {year}
//                   </h3>
//                   <div className="space-y-6">
//                     {yearStories.map((story) => (
//                       <StoryCard
//                         key={story._id}
//                         story={story}
//                         currentUserId={currentUserId}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               ))}
//           </div>
//         )}
//       </div>

//       {/* RIGHT SIDE — Family Info */}
//       <aside className="w-full lg:w-96 bg-white border-l border-gray-200 p-6 shadow-md">
//         <div className="text-center mb-6">
//           <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-purple-500 shadow-md">
//             <img
//               src={familyPhoto || "https://via.placeholder.com/150"}
//               alt={family_name}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <h2 className="mt-4 text-2xl font-bold text-purple-700">
//             {family_name}
//           </h2>
//           <p className="text-gray-600 text-sm">Family Circle</p>
//         </div>

//         <div className="space-y-3 text-sm text-gray-700">
//           <p>
//             👑 <span className="font-semibold">Male Root:</span>{" "}
//             {maleRoot ? maleRoot.fullname : "N/A"}
//           </p>
//           <p>
//             👑 <span className="font-semibold">Female Root:</span>{" "}
//             {femaleRoot ? femaleRoot.fullname : "N/A"}
//           </p>
//           <p>
//             💍 <span className="font-semibold">Marriage Date:</span>{" "}
//             {marriage_date
//               ? new Date(marriage_date).toLocaleDateString()
//               : "N/A"}
//           </p>
//           <p>
//             🔐 <span className="font-semibold">Invitation Code:</span>{" "}
//             <span className="text-purple-600 font-mono">
//               {invitation_code}
//             </span>
//           </p>
//         </div>
//       </aside>
//     </div>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                             ✅ STORY CARD INLINE                           */
// /* -------------------------------------------------------------------------- */

// const StoryCard = React.memo(({ story, currentUserId }) => {
//   const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
//   const [likes, setLikes] = useState(story.liked_by.length);
//   const [isLiked, setIsLiked] = useState(story.liked_by.includes(currentUserId));

//   const currentMedia = story.media[currentMediaIndex];
//   const totalMedia = story.media.length;

//   const uploader = story.uploaded_by_user || {
//     fullname: "Unknown User",
//     username: "unknown_user",
//     profilePhoto: "https://via.placeholder.com/40",
//   };

//   const timeAgo = useMemo(() => {
//     const diff = Date.now() - new Date(story.createdAt).getTime();
//     const minutes = Math.floor(diff / (1000 * 60));
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);

//     if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
//     if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
//     return `less than a minute ago`;
//   }, [story.createdAt]);

//   const handleLikeToggle = async (e) => {
//     e.preventDefault();
//     if (!currentUserId) return;

//     const endpoint = isLiked ? `/unlike/${story._id}` : `/like/${story._id}`;

//     setIsLiked((prev) => !prev);
//     setLikes((prev) => prev + (isLiked ? -1 : 1));

//     try {
//       await api.post(endpoint);
//     } catch (err) {
//       console.error("Like toggle failed:", err);
//       setIsLiked((prev) => !prev);
//       setLikes((prev) => prev - (isLiked ? -1 : 1));
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
//           <div className="flex flex-col items-center justify-center min-h-[150px] bg-purple-200 rounded-lg p-4">
//             <Volume2 size={32} className="text-purple-600 mb-3" />
//             <p className="text-gray-700 text-sm mb-2">Audio Memory</p>
//             <audio controls className="w-full max-w-xs">
//               <source src={mediaItem.url} type="audio/mp3" />
//               Your browser does not support the audio element.
//             </audio>
//           </div>
//         );
//       case "text":
//         return (
//           <div className="p-6 bg-purple-100 min-h-[200px] flex flex-col justify-center rounded-lg text-gray-700">
//             <p className="font-medium text-lg mb-2 whitespace-pre-wrap">{mediaItem.text}</p>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const goToNext = (e) => {
//     e.preventDefault();
//     setCurrentMediaIndex((prev) => (prev + 1) % totalMedia);
//   };

//   const goToPrev = (e) => {
//     e.preventDefault();
//     setCurrentMediaIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
//   };

//   const cleanedTags = (story.tags || [])
//     .map((tag) => tag.replace(/[\[\]"]/g, ""))
//     .filter((t) => t.length > 0);

//   return (
//     <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 mb-6 max-w-xl mx-auto">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center">
//           <img
//             src={uploader.profilePhoto || "https://via.placeholder.com/40"}
//             alt={uploader.fullname}
//             className="w-10 h-10 rounded-full mr-3 object-cover"
//           />
//           <div className="flex flex-col">
//             <div className="flex items-center space-x-2">
//               <p className="font-semibold text-gray-800">{uploader.fullname}</p>
//               <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
//                 Grandmother
//               </span>
//             </div>
//             <p className="text-xs text-gray-500">
//               @{uploader.username} • {timeAgo} • Johnson Family
//             </p>
//           </div>
//         </div>
//         <MoreVertical size={20} className="text-gray-500 hover:text-gray-800 cursor-pointer" />
//       </div>

//       {/* Media / Content */}
//       <div className="mb-4">
//         <h3 className="text-xl font-bold text-purple-700 mb-2 flex items-center space-x-2">
//           {currentMedia?.type === "image" && <ImageIcon size={20} className="text-purple-500" />}
//           {currentMedia?.type === "video" && <Film size={20} className="text-purple-500" />}
//           {currentMedia?.type === "audio" && <Volume2 size={20} className="text-purple-500" />}
//           {currentMedia?.type === "text" && <FileText size={20} className="text-purple-500" />}
//           <span>{story.title}</span>
//         </h3>
//         <p className="text-gray-700 mb-3">{story.caption}</p>

//         <div
//           className={`relative w-full ${
//             currentMedia?.type !== "text" && currentMedia?.type !== "audio"
//               ? "aspect-video"
//               : ""
//           } rounded-lg overflow-hidden border border-gray-300`}
//         >
//           {renderMedia(currentMedia)}

//           {totalMedia > 1 && (
//             <>
//               <button
//                 onClick={goToPrev}
//                 className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 z-10"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 onClick={goToNext}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 z-10"
//               >
//                 <ChevronRight size={20} />
//               </button>
//               <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-10">
//                 {currentMediaIndex + 1}/{totalMedia}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Tags */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         {cleanedTags.map((tag, i) => (
//           <span
//             key={i}
//             className="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-600"
//           >
//             #{tag}
//           </span>
//         ))}
//       </div>

//       {/* Actions */}
//       <div className="flex items-center justify-between border-t pt-3 border-gray-100">
//         <div className="flex space-x-6">
//           <button
//             onClick={handleLikeToggle}
//             className={`flex items-center text-sm transition-colors ${
//               isLiked ? "text-red-500" : "text-gray-500 hover:text-red-400"
//             }`}
//           >
//             <Heart
//               size={18}
//               fill={isLiked ? "currentColor" : "none"}
//               className="mr-1"
//             />{" "}
//             {likes}
//           </button>
//           <button className="flex items-center text-gray-500 hover:text-purple-600 transition-colors text-sm">
//             <MessageCircle size={18} className="mr-1" /> 0
//           </button>
//           <button className="flex items-center text-gray-500 hover:text-purple-600 transition-colors text-sm">
//             <Share2 size={18} className="mr-1" /> 0
//           </button>
//         </div>
//         <Bookmark
//           size={18}
//           className="text-gray-500 hover:text-purple-600 cursor-pointer"
//         />
//       </div>
//     </div>
//   );
// });
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/axios";
import { useAuth } from "../../utils/authContext";
import { useNavigate } from "react-router-dom";

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Film,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

export default function MemberFamilyPage() {
  const { familyId } = useParams();
  const { auth } = useAuth();
  const currentUserId = auth?.user?.user_id;
 const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [sortMode, setSortMode] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [familyDetails, setFamilyDetails] = useState(null);

  // Fetch family details
  const fetchFamilyDetails = useCallback(async () => {
    try {
      const res = await api.get(`/family/${familyId}`);
      setFamilyDetails(res.data.data);
    } catch (err) {
      console.error("Error fetching family:", err);
      setError("Failed to load family info.");
    }
  }, [familyId]);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    if (!familyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/content/family/${familyId}/${sortMode}`);
      setStories(res.data.data.stories || []);
    } catch (err) {
      console.error("Error fetching stories:", err);
      setError("Failed to load timeline stories.");
    } finally {
      setLoading(false);
    }
  }, [familyId, sortMode]);

  useEffect(() => {
    fetchFamilyDetails();
    fetchStories();
  }, [fetchFamilyDetails, fetchStories]);

  const groupByYear = (stories) => {
    const groups = {};
    stories.forEach((story) => {
      const date = new Date(story.memory_date || story.createdAt);
      const year = date.getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(story);
    });
    return groups;
  };

  const groupedStories = useMemo(() => groupByYear(stories), [stories]);

  if (loading && !stories.length) {
    return (
      <div className="flex justify-center items-center h-64 text-purple-600 text-lg font-medium">
        Loading memories...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-6">{error}</div>;
  }

  if (!familyDetails) {
    return <div className="text-center text-gray-600 p-6">Family not found.</div>;
  }

  const {
    family_name,
    familyPhoto,
    maleRoot,
    femaleRoot,
    invitation_code,
    marriage_date,
    description,
    memberships,
  } = familyDetails;

  // Exclude root members
  const memberList = memberships
    ?.map((m) => m.user)
    .filter(
      (u) =>
        u.user_id !== maleRoot?.user_id &&
        u.user_id !== femaleRoot?.user_id
    );

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      {/* LEFT SIDE — Timeline */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Family Beautiful Memories</h2>

          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${sortMode === "desc"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-800"
                } hover:bg-purple-100`}
              onClick={() => setSortMode("desc")}
            >
              Show by Recent
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${sortMode === "asc"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-800"
                } hover:bg-purple-100`}
              onClick={() => setSortMode("asc")}
            >
              Show by Memory Date
            </button>
          </div>
        </div>

        {/* TIMELINE */}
        {Object.keys(groupedStories).length === 0 ? (
          <p className="text-gray-600 text-center mt-10">
            No memories found for <b>{family_name}</b>.
          </p>
        ) : (
          <div className="max-w-full md:max-w-2xl lg:max-w-3xl mx-auto">
            {Object.entries(groupedStories)
              .sort((a, b) => (sortMode === "asc" ? a[0] - b[0] : b[0] - a[0]))
              .map(([year, yearStories]) => (
                <div key={year} className="mb-10">
                  <h3 className="text-xl font-semibold mb-4 border-l-4 border-purple-500 pl-3 text-gray-800">
                    {year}
                  </h3>
                  <div className="space-y-6">
                    {yearStories.map((story) => (
                      <StoryCard
                        key={story._id}
                        story={story}
                        currentUserId={currentUserId}
                        familyName={family_name}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE — Family Info */}
      <aside className="w-full lg:w-96 bg-white border-l border-gray-200 p-6 shadow-md">
        <div className="text-center mb-6">
          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-purple-500 shadow-md">
            <img
              src={familyPhoto || "https://via.placeholder.com/150"}
              alt={family_name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-purple-700">
            {family_name}
          </h2>
          <p className="text-gray-600 text-sm">{description || "Family Circle"}</p>
        </div>

        <div className="space-y-3 text-sm text-gray-700 mb-4">
          <p>
            👑 <span className="font-semibold">Male Root:</span>{" "}
            {maleRoot ? (
              <span className="flex items-center gap-2">
                <img
                  src={maleRoot.profilePhoto}
                  alt={maleRoot.fullname}
                  className="w-6 h-6 rounded-full object-cover"
                />{" "}
                {maleRoot.fullname}
              </span>
            ) : (
              "N/A"
            )}
          </p>
          <p>
            👑 <span className="font-semibold">Female Root:</span>{" "}
            {femaleRoot ? (
              <span className="flex items-center gap-2">
                <img
                  src={femaleRoot.profilePhoto}
                  alt={femaleRoot.fullname}
                  className="w-6 h-6 rounded-full object-cover"
                />{" "}
                {femaleRoot.fullname}
              </span>
            ) : (
              "N/A"
            )}
          </p>
          <p>
            💍 <span className="font-semibold">Marriage Date:</span>{" "}
            {marriage_date ? new Date(marriage_date).toLocaleDateString() : "N/A"}
          </p>
          <p>
            🔐 <span className="font-semibold">Invitation Code:</span>{" "}
            <span className="text-purple-600 font-mono">{invitation_code}</span>
          </p>
        </div>

        {memberList && memberList.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Members:</h3>
            <div className="flex flex-wrap gap-3">
              {memberList.map((m) => (
                <div key={m.user_id} className="flex items-center gap-2">
                  <img
                    src={m.profilePhoto || "https://via.placeholder.com/40"}
                    alt={m.fullname}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-700 text-sm">{m.fullname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

       <button
  onClick={async () => {
    if (!window.confirm("Are you sure you want to leave this family?")) return;
    try {
      await api.post(`/family/leave-family/${familyId}`);
      alert("You have left the family successfully.");
      navigate("/dashboard")
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to leave the family");
    }
  }}
  className="w-full  bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
>
  Leave Family
</button>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               STORY CARD                                    */
/* -------------------------------------------------------------------------- */
const StoryCard = React.memo(({ story, currentUserId, familyName }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [likes, setLikes] = useState(story.liked_by.length);
  const [isLiked, setIsLiked] = useState(story.liked_by.includes(currentUserId));

  const uploader = story.uploaded_by || {
    fullname: "Unknown User",
    username: "unknown_user",
    profilePhoto: "https://via.placeholder.com/40",
  };

  const goToNext = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % story.media.length);
  };

  const goToPrev = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + story.media.length) % story.media.length);
  };

  const handleLikeToggle = async () => {
    if (!currentUserId) return;
    const endpoint = isLiked ? `/unlike/${story._id}` : `/like/${story._id}`;
    setIsLiked((prev) => !prev);
    setLikes((prev) => prev + (isLiked ? -1 : 1));
    try {
      await api.post(endpoint);
    } catch (err) {
      setIsLiked((prev) => !prev);
      setLikes((prev) => prev - (isLiked ? -1 : 1));
      console.error(err);
    }
  };

  const renderMedia = (media) => {
    switch (media.type) {
      case "image":
        return <img src={media.url} alt="" className="w-full h-full object-cover rounded-lg" />;
      case "video":
        return <video src={media.url} controls className="w-full h-full rounded-lg" />;
      case "audio":
        return (
          <audio controls className="w-full">
            <source src={media.url} type="audio/mp3" />
          </audio>
        );
      case "text":
        return (
          <div className="p-4 bg-gray-100 rounded-lg min-h-[150px] flex items-center justify-center">
            {media.text}
          </div>
        );
      default:
        return null;
    }
  };

  const cleanedTags = (story.tags || []).map((t) => t.replace(/[\[\]"]/g, ""));

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col md:flex-row gap-4 border border-gray-200">
      {/* Media Box */}
      <div className="relative w-full md:w-2/3 rounded-lg">
        {story.media.length > 0 && renderMedia(story.media[currentMediaIndex])}

        {/* Arrows */}
        {story.media.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {currentMediaIndex + 1}/{story.media.length}
            </div>
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="w-full md:w-1/3 flex flex-col justify-between">
        {/* Uploader Info */}
        <div className="flex items-center gap-3 mb-2">
          <img
            src={uploader.profilePhoto || "https://via.placeholder.com/40"}
            alt={uploader.fullname}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{uploader.fullname}</p>
            {/* <p className="text-sm text-gray-500">@{uploader.username}</p> */}
            {/* <p className="text-xs text-gray-400">{familyName}</p> */}
          </div>
        </div>

        {/* Story Text */}
        <div className="mb-3">
          <h3 className="font-bold text-lg">{story.title}</h3>
          <p className="text-gray-700">{story.caption}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {cleanedTags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1 text-sm ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-400"
                }`}
            >
              <Heart size={18} /> {likes}
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
              <MessageCircle size={18} /> 0
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
              <Share2 size={18} /> 0
            </button>
          </div>
          <Bookmark size={18} className="text-gray-500 hover:text-purple-600 cursor-pointer" />
        </div>
      </div>
    </div>
  );
});

