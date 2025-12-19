import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const UserInfo: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="flex items-center gap-2 px-3">
      <img
        src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'Admin')}&background=ea580c&color=fff`}
        alt="Profile"
        className="w-8 h-8 rounded-full"
      />
      <div className="text-sm">
        <p className="font-medium text-white">
          {user?.user_metadata?.full_name || 'Admin'}
        </p>
        <p className="text-white text-opacity-80 text-xs">
          {user?.email || 'Authenticated'}
        </p>
      </div>
    </div>
  );
};
