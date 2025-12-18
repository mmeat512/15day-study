"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Loader2, Send, Trash2, Edit2 } from "lucide-react";
import { Comment } from "../../types/study";
import {
  getCommentsAction,
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
} from "../../actions/submissionActions";
import { useAuth } from "../../contexts/AuthContext";

interface CommentsSectionProps {
  submissionId: string;
  studyId: string;
}

export function CommentsSection({
  submissionId,
  studyId,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadComments();
  }, [submissionId]);

  async function loadComments() {
    try {
      setLoading(true);
      const commentsData = await getCommentsAction(submissionId);
      // Comments now include user data from Drizzle relations
      setComments(commentsData);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePostComment() {
    if (!user?.uid || !newComment.trim()) return;

    try {
      setPosting(true);
      await createCommentAction(submissionId, studyId, user.uid, newComment.trim());
      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editContent.trim()) return;

    try {
      await updateCommentAction(commentId, editContent.trim());

      // Update local state instead of refetching all comments
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: editContent.trim(), updatedAt: new Date() }
            : comment
        )
      );

      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteCommentAction(commentId);

      // Remove from local state instead of refetching all comments
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        💬 Comments ({comments.length})
      </h3>

      {/* New Comment Input */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <div className="flex justify-end">
          <Button
            onClick={handlePostComment}
            disabled={posting || !newComment.trim()}
            size="sm"
          >
            {posting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Post Comment
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2"
            >
              {editingId === comment.id ? (
                // Edit Mode
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {comment.user?.username || "Anonymous"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {comment.createdAt.toLocaleDateString()}{" "}
                        {comment.createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                    {user?.uid === comment.userId && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
