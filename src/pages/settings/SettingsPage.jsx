import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { User, Save, CheckCircle, Camera } from 'lucide-react';
import { settingsSchema } from '../../validators/authValidators';
import { updateProfile } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import './SettingsPage.css';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  // Reset form when user loads
  useEffect(() => {
    if (user) {
      reset({ 
        name: user.name || '', 
        email: user.email || '',
        age: user.age || '',
        weight: user.weight || '',
        height: user.height || '',
        gender: user.gender || ''
      });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    dispatch(updateProfile(data));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateProfile({ avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-container" data-aos="fade-in">
      <header className="settings-header">
        <h1>Settings & Profile</h1>
        <p>Manage your account preferences and personal information.</p>
      </header>

      <div className="settings-content">
        <div className="settings-section" data-aos="fade-right">
          <Card title="Profile Information" className="settings-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large" onClick={handleAvatarClick}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="avatar-image" />
                ) : (
                  <User size={48} />
                )}
                <div className="avatar-overlay">
                  <Camera size={24} />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
              <div className="profile-avatar-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="settings-form">
              <Input 
                label="Full Name" 
                placeholder="Enter your name" 
                {...register('name')}
                error={errors.name?.message}
              />
              
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="Enter your email" 
                {...register('email')}
                error={errors.email?.message}
              />

              <div className="settings-grid">
                <Input 
                  label="Age" 
                  type="number" 
                  placeholder="Enter your age" 
                  {...register('age')}
                  error={errors.age?.message}
                />
                
                <Input 
                  label="Gender" 
                  type="select" 
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Non-Binary', label: 'Non-Binary' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' }
                  ]}
                  {...register('gender')}
                  error={errors.gender?.message}
                />
              </div>

              <div className="settings-grid">
                <Input 
                  label="Weight (kg)" 
                  type="number" 
                  placeholder="Enter weight in kg" 
                  {...register('weight')}
                  error={errors.weight?.message}
                />
                
                <Input 
                  label="Height (cm)" 
                  type="number" 
                  placeholder="Enter height in cm" 
                  {...register('height')}
                  error={errors.height?.message}
                />
              </div>

              <div className="form-actions">
                <Button type="submit" disabled={!isDirty}>
                  <Save size={18} style={{ marginRight: '8px' }} />
                  Save Changes
                </Button>
                {saveSuccess && (
                  <span className="success-message">
                    <CheckCircle size={16} /> Profile updated!
                  </span>
                )}
              </div>
            </form>
          </Card>
        </div>

        <div className="settings-section" data-aos="fade-left">
          <Card title="App Preferences" className="settings-card">
            <div className="preference-item">
              <div className="preference-info">
                <h4>Theme Mode</h4>
                <p>Matte Athletic Carbon (Dark mode active)</p>
              </div>
              <span className="theme-status-badge">Dark</span>
            </div>
            
            {/* Additional preferences could go here (e.g. notifications, units) */}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
