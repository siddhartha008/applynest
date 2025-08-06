import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/client";
import SideBar from "../../components/sidebar/sidebar";
import { MessageSquare, Heart, Plus, Filter, Search, Edit, Edit2Icon, DeleteIcon, Clock, TrendingUp, ChevronDown } from "lucide-react";
import "./Forum.css";

const Forum = ({ user }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [userLikes, setUserLikes] = useState(new Set());
    const [currentUserId, setCurrentUserId] = useState(null);
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'most_liked'
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        category: 'advice',
        university_name: '',
        program_name: '',
        image_url: ''
    });

    const categories = [
        { value: 'all', label: 'All Posts' },
        { value: 'advice', label: 'Application Advice' },
        { value: 'essay', label: 'Essays & Writing' },
        { value: 'experience', label: 'Experiences' },
        { value: 'question', label: 'Questions' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First', icon: Clock },
        { value: 'oldest', label: 'Oldest First', icon: Clock },
        { value: 'most_liked', label: 'Most Liked', icon: TrendingUp }
    ];

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [selectedCategory, searchQuery]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close filter dropdown if clicking outside
            if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
                setShowFilterDropdown(false);
            }
            // Close sort dropdown if clicking outside
            if (showSortDropdown && !event.target.closest('.sort-dropdown')) {
                setShowSortDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilterDropdown, showSortDropdown]);

    // Close modal with Escape key
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                if (showCreatePost) {
                    setShowCreatePost(false);
                }
                if (showEditModal) {
                    setShowEditModal(false);
                    setEditingPost(null);
                }
                if (showFilterDropdown) {
                    setShowFilterDropdown(false);
                }
                if (showSortDropdown) {
                    setShowSortDropdown(false);
                }
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [showCreatePost, showEditModal, showFilterDropdown, showSortDropdown]);

    useEffect(() => {
        if (currentUserId) {
            fetchUserLikes();
        }
    }, [currentUserId]);

    useEffect(() => {
        sortPosts();
    }, [sortBy]);

    const getCurrentUser = async () => {
        try {
            const { data: { user: currentUser }, error } = await supabase.auth.getUser();
            if (!error && currentUser) {
                setCurrentUserId(currentUser.id);
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            
            let allPostsQuery = supabase
                .from('posts')
                .select(`
                    id,
                    title,
                    content,
                    category,
                    university_name,
                    program_name,
                    user_id,
                    created_at, 
                    image_url
                `);

            if (selectedCategory !== 'all') {
                allPostsQuery = allPostsQuery.eq('category', selectedCategory);
            }

            if (searchQuery.trim()) {
                allPostsQuery = allPostsQuery.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,university_name.ilike.%${searchQuery}%`);
            }

            const { data: allPosts, error: allPostsError } = await allPostsQuery;
            if (allPostsError) throw allPostsError;

            // Get like counts for all posts
            const postIds = allPosts.map(post => post.id);
            if (postIds.length > 0) {
                const { data: likeCounts, error: likeError } = await supabase
                    .from('likes')
                    .select('post_id')
                    .in('post_id', postIds);

                if (likeError) throw likeError;

                // Count likes per post
                const likeCountMap = {};
                likeCounts.forEach(like => {
                    likeCountMap[like.post_id] = (likeCountMap[like.post_id] || 0) + 1;
                });

                // Get comment counts for all posts
                const { data: commentCounts, error: commentError } = await supabase
                    .from('comments')
                    .select('post_id')
                    .in('post_id', postIds);

                if (commentError) throw commentError;

                // Count comments per post
                const commentCountMap = {};
                commentCounts.forEach(comment => {
                    commentCountMap[comment.post_id] = (commentCountMap[comment.post_id] || 0) + 1;
                });

                // Combine posts with their like and comment counts
                const postsWithCounts = allPosts.map(post => ({
                    ...post,
                    likes_count: likeCountMap[post.id] || 0,
                    comments_count: commentCountMap[post.id] || 0
                }));

                setPosts(postsWithCounts);
                sortPosts(postsWithCounts);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserLikes = async () => {
        if (!currentUserId) return;

        try {
            const { data, error } = await supabase
                .from('likes')
                .select('post_id')
                .eq('user_id', currentUserId);

            if (error) throw error;
            
            const likedPosts = new Set(data.map(like => like.post_id));
            setUserLikes(likedPosts);
        } catch (error) {
            console.error('Error fetching user likes:', error);
        }
    };

    const sortPosts = (postsToSort = posts) => {
        const sorted = [...postsToSort];
        
        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'most_liked':
                sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
                break;
            default:
                break;
        }
        
        setPosts(sorted);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        if (!newPost.title.trim() || !newPost.content.trim()) {
            alert('Please fill in both title and content');
            return;
        }

        if (!currentUserId) {
            alert('Please log in to create posts');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('posts')
                .insert([{
                    ...newPost,
                    user_id: currentUserId
                }]);

            if (error) throw error;

            setNewPost({
                title: '',
                content: '',
                category: 'advice',
                university_name: '',
                program_name: ''
            });
            setShowCreatePost(false);
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post. Please try again.');
        }
    };

    const handleLike = async (postId, e) => {
        e.stopPropagation();

        if (!currentUserId) {
            alert('Please log in to like posts');
            return;
        }

        try {
            const isLiked = userLikes.has(postId);

            if (isLiked) {
                // Unlike
                const { error: deleteError } = await supabase
                    .from('likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', currentUserId);

                if (deleteError) throw deleteError;

                // Update local state immediately
                const newUserLikes = new Set(userLikes);
                newUserLikes.delete(postId);
                setUserLikes(newUserLikes);

                // Update posts state immediately for better UX
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? { ...post, likes_count: Math.max(0, (post.likes_count || 0) - 1) }
                            : post
                    )
                );
            } else {
                // Like
                const { error: insertError } = await supabase
                    .from('likes')
                    .insert([{ post_id: postId, user_id: currentUserId }]);

                if (insertError) throw insertError;
                
                const newUserLikes = new Set(userLikes);
                newUserLikes.add(postId);
                setUserLikes(newUserLikes);

                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? { ...post, likes_count: (post.likes_count || 0) + 1 }
                            : post
                    )
                );
            }

        } catch (error) {
            console.error('Error handling like:', error);
            alert('Error updating like. Please try again.');
            // Revert local state on error
            fetchPosts();
            fetchUserLikes();
        }
    };

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    const handleCommentClick = (postId, e) => {
        e.stopPropagation();
        navigate(`/post/${postId}`);
    };

    const handleEditPost = (post, e) => {
        e.stopPropagation();
        setEditingPost({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            university_name: post.university_name || '',
            program_name: post.program_name || '',
            image_url: post.image_url || ''
        });
        setShowEditModal(true);
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        
        if (!editingPost.title.trim() || !editingPost.content.trim()) {
            alert('Please fill in both title and content');
            return;
        }

        try {
            const { error } = await supabase
                .from('posts')
                .update({
                    title: editingPost.title,
                    content: editingPost.content,
                    category: editingPost.category,
                    university_name: editingPost.university_name,
                    program_name: editingPost.program_name
                })
                .eq('id', editingPost.id)
                .eq('user_id', currentUserId); // Ensure user owns the post

            if (error) throw error;

            alert('Post updated successfully!');
            setShowEditModal(false);
            setEditingPost(null);
            fetchPosts();
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Error updating post. Please try again.');
        }
    };

    const handleDeletePost = async (postId, e) => { 
        e.stopPropagation();
        const confirmDelete = window.confirm("Are you sure you want to delete this post?"); 
        if (!confirmDelete) return;
        
        try { 
            // Delete associated comments first
            await supabase.from("comments").delete().eq("post_id", postId);
            
            // Delete associated likes
            await supabase.from("likes").delete().eq("post_id", postId);
            
            // Then delete the post
            const {error} = await supabase.from("posts").delete().eq("id", postId);
            if (error) throw error;
            
            alert("Post deleted");
            fetchPosts();
        } catch (error) { 
            console.error('Error deleting post:', error);
            alert('Error deleting post. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
            }
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            advice: '#10b981',
            essay: '#8b5cf6',
            experience: '#f59e0b',
            question: '#ef4444'
        };
        return colors[category] || '#6b7280';
    };

    const getUserName = (userId) => {
        if (userId === currentUserId) {
            return "You";
        }
        return "User";
    };

    const truncateContent = (content, maxLength = 200) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <div className="forum-container">
            <div className="sidebar-section">
                <SideBar name={user?.user?.user_metadata?.first_name} />
            </div>
            <div className="main-content">
                <div className="forum-header">
                    <h1 className="headingText">University Forum</h1>
                    <p className="forum-subtitle">Share advice, experiences, and connect with fellow applicants</p>
                </div>

                <div className="forum-controls">
                    <div className="search-filter-section">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-dropdown">
                            <button 
                                className="filter-button"
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                                <Filter size={16} />
                                <span>{categories.find(cat => cat.value === selectedCategory)?.label}</span>
                                <ChevronDown size={16} className={showFilterDropdown ? 'rotate' : ''} />
                            </button>
                            {showFilterDropdown && (
                                <div className="dropdown-menu">
                                    {categories.map(category => (
                                        <button
                                            key={category.value}
                                            className={`dropdown-item ${selectedCategory === category.value ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(category.value);
                                                setShowFilterDropdown(false);
                                            }}
                                        >
                                            <span 
                                                className="category-indicator"
                                                style={{ 
                                                    backgroundColor: category.value === 'all' 
                                                        ? '#6b7280' 
                                                        : getCategoryColor(category.value) 
                                                }}
                                            />
                                            <span>{category.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="sort-dropdown">
                            <button 
                                className="sort-button"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                            >
                                {sortOptions.find(opt => opt.value === sortBy)?.icon && 
                                    React.createElement(sortOptions.find(opt => opt.value === sortBy).icon, { size: 16 })}
                                <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                                <ChevronDown size={16} className={showSortDropdown ? 'rotate' : ''} />
                            </button>
                            {showSortDropdown && (
                                <div className="dropdown-menu">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`dropdown-item ${sortBy === option.value ? 'active' : ''}`}
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setShowSortDropdown(false);
                                            }}
                                        >
                                            {React.createElement(option.icon, { size: 16 })}
                                            <span>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        className="create-post-btn"
                        onClick={() => setShowCreatePost(true)}
                    >
                        <Plus size={20} />
                        Create Post
                    </button>
                </div>

                {showCreatePost && (
                    <div className="create-post-modal">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Create New Post</h3>
                            <form onSubmit={handleCreatePost}>
                                <input
                                    type="text"
                                    placeholder="Post title..."
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                    required
                                />

                                <div className="form-row">
                                    <select
                                        value={newPost.category}
                                        onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                                    >
                                        <option value="advice">Application Advice</option>
                                        <option value="essay">Essays & Writing</option>
                                        <option value="experience">Experiences</option>
                                        <option value="question">Questions</option>
                                    </select>
                                </div>

                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="University name (optional)"
                                        value={newPost.university_name}
                                        onChange={(e) => setNewPost({...newPost, university_name: e.target.value})}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Program name (optional)"
                                        value={newPost.program_name}
                                        onChange={(e) => setNewPost({...newPost, program_name: e.target.value})}
                                    />
                                    
                                </div>

                                <textarea
                                    placeholder="Share your thoughts, advice, or questions..."
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                    rows={6}
                                    required
                                />
                                <input
    type="text"
    placeholder="Image URL (optional)"
    value={newPost.image_url}
    onChange={(e) => setNewPost({...newPost, image_url: e.target.value})}
/>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowCreatePost(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit">
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showEditModal && editingPost && (
                    <div className="create-post-modal">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Edit Post</h3>
                            <form onSubmit={handleUpdatePost}>
                                <input
                                    type="text"
                                    placeholder="Post title..."
                                    value={editingPost.title}
                                    onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                                    required
                                />

                                <div className="form-row">
                                    <select
                                        value={editingPost.category}
                                        onChange={(e) => setEditingPost({...editingPost, category: e.target.value})}
                                    >
                                        <option value="advice">Application Advice</option>
                                        <option value="essay">Essays & Writing</option>
                                        <option value="experience">Experiences</option>
                                        <option value="question">Questions</option>
                                    </select>
                                </div>

                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="University name (optional)"
                                        value={editingPost.university_name}
                                        onChange={(e) => setEditingPost({...editingPost, university_name: e.target.value})}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Program name (optional)"
                                        value={editingPost.program_name}
                                        onChange={(e) => setEditingPost({...editingPost, program_name: e.target.value})}
                                    />
                                </div>

                                <textarea
                                    placeholder="Share your thoughts, advice, or questions..."
                                    value={editingPost.content}
                                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                                    rows={6}
                                    required
                                />
                                <input
    type="text"
    placeholder="Image URL (optional)"
    value={editingPost.image_url}
    onChange={(e) => setEditingPost({...editingPost, image_url: e.target.value})}
/>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => {
                                        setShowEditModal(false);
                                        setEditingPost(null);
                                    }}>
                                        Cancel
                                    </button>
                                    <button type="submit">
                                        Update Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="posts-container">
                    {loading ? (
                        <div className="loading">Loading posts...</div>
                    ) : posts.length === 0 ? (
                        <div className="no-posts">
                            <div className="no-posts-icon">💬</div>
                            <h3>No posts found</h3>
                            <p>
                                {searchQuery || selectedCategory !== 'all' 
                                    ? 'Try adjusting your search or filter.' 
                                    : 'Be the first to share advice or ask a question!'
                                }
                            </p>
                            {!searchQuery && selectedCategory === 'all' && (
                                <button 
                                    className="create-first-post-btn"
                                    onClick={() => setShowCreatePost(true)}
                                >
                                    Create First Post
                                </button>
                            )}
                        </div>
                    ) : (
                        posts.map(post => (
                            <div 
                                key={post.id} 
                                className="post-card clickable"
                            >
                                <div className="post-header">
                                    <div className="post-meta">
                                        <span 
                                            className="category-tag"
                                            style={{ backgroundColor: getCategoryColor(post.category) }}
                                        >
                                            {categories.find(c => c.value === post.category)?.label}
                                        </span>
                                        <span className="post-author">
                                            by {getUserName(post.user_id)}
                                        </span>
                                        <span className="post-date">
                                            {formatDate(post.created_at)}
                                        </span>
                                        <span>
                                            {post.user_id === currentUserId && (
                                                <Edit2Icon 
                                                    size={16} 
                                                    color="#123458" 
                                                    onClick={(e) => handleEditPost(post, e)}
                                                    style={{ cursor: 'pointer' }}
                                                    title="Edit post"
                                                />
                                            )}
                                        </span>
                                        <span>
                                            {post.user_id === currentUserId && (
                                                <DeleteIcon 
                                                    size={16} 
                                                    color="#123458" 
                                                    onClick={(e) => handleDeletePost(post.id, e)} 
                                                    style={{ cursor: 'pointer' }}
                                                    title="Delete post"
                                                />
                                            )}   
                                        </span>
                                    </div>
                                </div>
                                <div onClick={() => handlePostClick(post.id)}>
                                    <h3 className="post-title">{post.title}</h3>
                                    
                                    {(post.university_name || post.program_name) && (
                                        <div className="post-university">
                                            {post.university_name && <span>🎓 {post.university_name}</span>}
                                            {post.program_name && <span> - {post.program_name}</span>}
                                        </div>
                                    )}

                                    <p className="post-content">{truncateContent(post.content)}</p>

                                    <div className="post-actions">
                                        <button 
                                            className={`action-btn like-btn ${userLikes.has(post.id) ? 'liked' : ''}`}
                                            onClick={(e) => handleLike(post.id, e)}
                                        >
                                            <Heart 
                                                size={18} 
                                                fill={userLikes.has(post.id) ? "#123458" : "none"}
                                                color={userLikes.has(post.id) ? "#123458" : "currentColor"}
                                            />
                                            {post.likes_count || 0}
                                        </button>
                                        
                                        <button 
                                            className="action-btn comment-btn"
                                            onClick={(e) => handleCommentClick(post.id, e)}
                                        >
                                            <MessageSquare size={18} />
                                            {post.comments_count || 0}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Forum;