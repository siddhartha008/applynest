import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/client";
import SideBar from "../../components/sidebar/sidebar";
import { Heart, Reply, ArrowLeft, Send } from "lucide-react";
import "./PostDetail.css";

const PostDetail = ({ user }) => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);

    const categories = [
        { value: 'advice', label: 'Application Advice' },
        { value: 'essay', label: 'Essays & Writing' },
        { value: 'experience', label: 'Experiences' },
        { value: 'question', label: 'Questions' }
    ];

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (postId && currentUserId !== null) {
            fetchPost();
            fetchComments();
            if (currentUserId) {
                checkIfLiked();
            }
        }
    }, [postId, currentUserId]);

    const getCurrentUser = async () => {
        try {
            const { data: { user: currentUser }, error } = await supabase.auth.getUser();
            if (!error && currentUser) {
                setCurrentUserId(currentUser.id);
            } else {
                setCurrentUserId(null);
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            setCurrentUserId(null);
        }
    };

    const fetchPost = async () => {
        try {
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single();
    
            if (postError) throw postError;
    
            // Fetch the number of likes for this post
            const { count: likesCount, error: likesError } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true }) // 'exact' ensures an accurate count
                .eq('post_id', postId);
    
            if (likesError) throw likesError;
            
            // Combine the post data with the likes count
            setPost({
                ...postData,
                likes_count: likesCount
            });
    
        } catch (error) {
            console.error('Error fetching post or likes count:', error);
            navigate('/forum');
        }
    };
    
    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Organize comments into threads (parent comments with their replies)
            const commentMap = {};
            const topLevelComments = [];

            data.forEach(comment => {
                commentMap[comment.id] = { ...comment, replies: [] };
            });

            data.forEach(comment => {
                if (comment.parent_comment_id) {
                    // This is a reply
                    if (commentMap[comment.parent_comment_id]) {
                        commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
                    }
                } else {
                    // This is a top-level comment
                    topLevelComments.push(commentMap[comment.id]);
                }
            });

            setComments(topLevelComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkIfLiked = async () => {
        if (!currentUserId) {
            setIsLiked(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', currentUserId)
                .maybeSingle();

            setIsLiked(!!data);
        } catch (error) {
            console.error('Error checking like status:', error);
            setIsLiked(false);
        }
    };

    const handleLike = async () => {
        if (!currentUserId) {
            alert('Please log in to like posts');
            return;
        }

        try {
            if (isLiked) {
                // Unlike
                const { error } = await supabase
                    .from('likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', currentUserId);
                
                if (error) throw error;
                
                setIsLiked(false);
                setPost(prev => ({
                    ...prev,
                    likes_count: Math.max(0, (prev.likes_count || 0) - 1)
                }));
            } else {
                // Like
                const { error } = await supabase
                    .from('likes')
                    .insert([{ post_id: postId, user_id: currentUserId }]);
                
                if (error) throw error;
                
                setIsLiked(true);
                setPost(prev => ({
                    ...prev,
                    likes_count: (prev.likes_count || 0) + 1
                }));
            }
        } catch (error) {
            console.error('Error handling like:', error);
            // Revert optimistic update and refresh from server
            fetchPost();
            checkIfLiked();
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        if (!currentUserId) {
            alert('Please log in to comment');
            return;
        }

        try {
            const { error } = await supabase
                .from('comments')
                .insert([{
                    post_id: postId,
                    user_id: currentUserId,
                    content: newComment,
                    parent_comment_id: null
                }]);

            if (error) throw error;

            setNewComment('');
            fetchComments();
            fetchPost(); // Refresh to get updated comment count
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Error adding comment. Please try again.');
        }
    };

    const handleAddReply = async (parentCommentId) => {
        if (!replyText.trim()) return;

        if (!currentUserId) {
            alert('Please log in to reply');
            return;
        }

        try {
            const { error } = await supabase
                .from('comments')
                .insert([{
                    post_id: postId,
                    user_id: currentUserId,
                    content: replyText,
                    parent_comment_id: parentCommentId
                }]);

            if (error) throw error;

            setReplyText('');
            setReplyingTo(null);
            fetchComments();
        } catch (error) {
            console.error('Error adding reply:', error);
            alert('Error adding reply. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        // Check if this is the current user
        if (userId === currentUserId) {
            return "You";
        }
        return user.first_name ? user.first_name : "User";
    };

    const CommentComponent = ({ comment, level = 0 }) => (
        <div className={`comment ${level > 0 ? 'reply' : ''}`} style={{ marginLeft: `${level * 20}px` }}>
            <div className="comment-header">
                <span className="comment-author">{getUserName(comment.user_id)}</span>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
            </div>
            <p className="comment-content">{comment.content}</p>
            <div className="comment-actions">
                <button 
                    className="reply-btn"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                    <Reply size={14} />
                    Reply
                </button>
            </div>
            
            {replyingTo === comment.id && (
                <div className="reply-form">
                    <textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                    />
                    <div className="reply-actions">
                        <button onClick={() => setReplyingTo(null)}>Cancel</button>
                        <button onClick={() => handleAddReply(comment.id)}>
                            <Send size={14} />
                            Reply
                        </button>
                    </div>
                </div>
            )}
            
            {comment.replies && comment.replies.map((reply) => (
                <CommentComponent 
                    key={reply.id} 
                    comment={reply} 
                    level={level + 1} 
                />
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="post-detail-container">
                <div className="sidebar-section">
                    <SideBar name={user?.user?.user_metadata?.first_name} />
                </div>
                <div className="main-content">
                    <div className="loading">Loading post...</div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="post-detail-container">
                <div className="sidebar-section">
                    <SideBar name={user?.user?.user_metadata?.first_name} />
                </div>
                <div className="main-content">
                    <div className="error-message">
                        <h2>Post not found</h2>
                        <button onClick={() => navigate('/forum')} className="back-btn">
                            <ArrowLeft size={16} />
                            Back to Forum
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="post-detail-container">
            <div className="sidebar-section">
                <SideBar name={user?.user?.user_metadata?.first_name} />
            </div>
            <div className="main-content">
                <div className="post-detail-header">
                    <button onClick={() => navigate('/forum')} className="back-btn">
                        <ArrowLeft size={16} />
                        Back to Forum
                    </button>
                </div>

                <div className="post-detail-card">
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
                        </div>
                    </div>

                    <h1 className="post-title">{post.title}</h1>

                    {post.image_url && (
    <div className="post-image-container">
        <img src={post.image_url} alt={post.title} className="post-image" />
    </div>
)}
                    
                    {(post.university_name || post.program_name) && (
                        <div className="post-university">
                            {post.university_name && <span>🎓 {post.university_name}</span>}
                            {post.program_name && <span> - {post.program_name}</span>}
                        </div>
                    )}

                    <div className="post-content">{post.content}</div>

                    <div className="post-actions">
                        <button 
                            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            <Heart 
                                size={18} 
                                fill={isLiked ? "currentColor" : "none"}
                                color={isLiked ? "currentColor" : "currentColor"}
                            />
                            {post.likes_count || 0} {(post.likes_count || 0) === 1 ? 'Like' : 'Likes'}
                        </button>
                        
                        <span className="comments-count">
                            {post.comments_count || 0} {(post.comments_count || 0) === 1 ? 'Comment' : 'Comments'}
                        </span>
                    </div>
                </div>

                <div className="comments-section">
                    <h3>Comments</h3>
                    
                    <div className="add-comment">
                        <textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                        />
                        <button 
                            className="add-comment-btn"
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                        >
                            <Send size={16} />
                            Comment
                        </button>
                    </div>

                    <div className="comments-list">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <CommentComponent 
                                    key={comment.id} 
                                    comment={comment} 
                                />
                            ))
                        ) : (
                            <div className="no-comments">
                                <p>No comments yet. Be the first to comment!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;