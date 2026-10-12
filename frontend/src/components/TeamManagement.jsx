import React, { useState } from 'react';
import { Users, Shield, Clock, MoreVertical, UserPlus, Mail, Trash2, Edit } from 'lucide-react';

export default function TeamManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alex Johnson', email: 'alex@brandpulse.io', role: 'Admin', lastLogin: '2 mins ago', status: 'Active' },
    { id: 2, name: 'Sarah Williams', email: 'sarah@brandpulse.io', role: 'Manager', lastLogin: '1 hour ago', status: 'Active' },
    { id: 3, name: 'Mike Chen', email: 'mike@brandpulse.io', role: 'Analyst', lastLogin: 'Yesterday', status: 'Active' },
    { id: 4, name: 'Emma Davis', email: 'emma@brandpulse.io', role: 'Viewer', lastLogin: '5 days ago', status: 'Invited' }
  ]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const toggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  const removeUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="card w-full p-6 rounded-[18px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-500" />
            Team Members
          </h3>
          <p className="text-sm text-slate-500 mt-1">Manage workspace access and role permissions</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-bold border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    {user.role === 'Admin' && <Shield className="w-3.5 h-3.5 text-amber-500" />}
                    {user.role}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                    user.status === 'Invited' ? 'bg-sky-500/10 text-sky-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {user.lastLogin}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-sky-400 transition-colors" title="Edit Role">
                      <Edit className="w-4 h-4" />
                    </button>
                    {user.status === 'Invited' && (
                      <button className="p-1.5 text-slate-400 hover:text-purple-400 transition-colors" title="Resend Invite">
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => toggleStatus(user.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors" 
                      title={user.status === 'Active' ? "Deactivate" : "Activate"}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeUser(user.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" 
                      title="Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1.5">Email Address</label>
                <input type="email" placeholder="colleague@company.com" className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1.5">Role</label>
                <select className="input w-full">
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Analyst</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsInviteModalOpen(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={() => setIsInviteModalOpen(false)} className="btn btn-primary">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
