// app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { api, User } from '@/lib/api'
import { Search, Users, Shield, UserCheck, UserX, X, ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-purple-600 bg-purple-100' },
  { value: 'viewer', label: 'Viewer', icon: UserCheck, color: 'text-blue-600 bg-blue-100' },
  { value: 'locked', label: 'Locked', icon: ShieldOff, color: 'text-red-600 bg-red-100' },
]

const ROLE_BADGE_STYLES = {
  admin: 'bg-purple-100 text-purple-800',
  viewer: 'bg-blue-100 text-blue-800',
  locked: 'bg-red-100 text-red-800',
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [userToAction, setUserToAction] = useState<{ id: number; username: string; action: string } | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (u) =>
            u.username.toLowerCase().includes(query) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.name && u.name.toLowerCase().includes(query))
        )
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      setUsers(data)
      setFilteredUsers(data)
      setError(null)
    } catch (err) {
      setError('Failed to load users')
      showToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string, username: string) => {
    // Prevent changing your own role to locked or viewer (to avoid locking yourself out)
    if (currentUser && userId === currentUser.id && newRole !== 'admin') {
      showToast('You cannot demote yourself from admin', 'error')
      return
    }

    setUserToAction({ id: userId, username, action: `change role to ${newRole}` })
    setShowConfirmDialog(true)
  }

  const confirmAction = async () => {
    if (!userToAction) return
    
    const { id, username, action } = userToAction
    setShowConfirmDialog(false)
    setUpdatingId(id)

    try {
      // Parse the action to determine what to do
      if (action.startsWith('change role to ')) {
        const newRole = action.replace('change role to ', '')
        await api.updateUserRole(id, newRole)
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
        showToast(`User "${username}" role updated to ${newRole}`, 'success')
      } else if (action === 'delete') {
        await api.deleteUser(id)
        setUsers(users.filter(u => u.id !== id))
        showToast(`User "${username}" deleted successfully`, 'success')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error')
    } finally {
      setUpdatingId(null)
      setUserToAction(null)
    }
  }

  const cancelAction = () => {
    setShowConfirmDialog(false)
    setUserToAction(null)
  }

  const handleDelete = async (userId: number, username: string) => {
    // Prevent deleting yourself
    if (currentUser && userId === currentUser.id) {
      showToast('You cannot delete yourself', 'error')
      return
    }
    
    // Prevent deleting the last admin
    const adminCount = users.filter(u => u.role === 'admin').length
    const userToDelete = users.find(u => u.id === userId)
    if (adminCount <= 1 && userToDelete?.role === 'admin') {
      showToast('Cannot delete the last admin user', 'error')
      return
    }

    setUserToAction({ id: userId, username, action: 'delete' })
    setShowConfirmDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const adminCount = users.filter(u => u.role === 'admin').length

  return (
    <div>
      {/* Confirmation Dialog */}
      {showConfirmDialog && userToAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
              <button
                onClick={cancelAction}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to <strong>{userToAction.action}</strong> for <strong>"{userToAction.username}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelAction}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  userToAction.action === 'delete'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="search-users"
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            title="Search users by username, email, or name"
            aria-label="Search users"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-xl font-bold text-gray-900">{adminCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Locked</p>
              <p className="text-xl font-bold text-gray-900">
                {users.filter(u => u.role === 'locked').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        {user.email && (
                          <p className="text-sm text-gray-500">{user.email}</p>
                        )}
                        {user.name && (
                          <p className="text-xs text-gray-400">{user.name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE_STYLES[user.role as keyof typeof ROLE_BADGE_STYLES]}`}>
                      {user.role}
                    </span>
                    {currentUser && user.id === currentUser.id && (
                      <span className="ml-2 text-xs text-gray-400">(you)</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'locked' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'locked' ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Role Change */}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleRoleChange(user.id, 'admin', user.username)}
                          disabled={updatingId === user.id}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                          title="Make Admin"
                        >
                          Make Admin
                        </button>
                      )}
                      {user.role !== 'viewer' && (
                        <button
                          onClick={() => handleRoleChange(user.id, 'viewer', user.username)}
                          disabled={updatingId === user.id}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                          title="Make Viewer"
                        >
                          Make Viewer
                        </button>
                      )}
                      {user.role !== 'locked' && (
                        <button
                          onClick={() => handleRoleChange(user.id, 'locked', user.username)}
                          disabled={updatingId === user.id}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          title="Lock User"
                        >
                          Lock
                        </button>
                      )}
                      {/* Delete Button */}
                      {user.role !== 'admin' && currentUser && user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={updatingId === user.id}
                          className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}