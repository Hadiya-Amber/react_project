import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import { Person, Save, Edit } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';
import api from '@/api/axios';

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  occupation: string;
  monthlyIncome?: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setProfile(response.data.data);
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      setError('');
      
      const updateData = {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        postalCode: profile.postalCode,
        country: profile.country,
        occupation: profile.occupation,
        monthlyIncome: profile.monthlyIncome,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone
      };
      
      const response = await api.put('/auth/profile', updateData);
      if (response.data.success) {
        showNotification('Profile updated successfully', NotificationType.SUCCESS);
        setEditing(false);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Profile</Typography>
        <Alert severity="error">Failed to load profile information</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Card>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5">{profile.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box ml="auto">
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile(); // Reset changes
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={profile.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={profile.email}
                disabled // Email should not be editable
                helperText="Email cannot be changed"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profile.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={profile.dateOfBirth?.split('T')[0] || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Address Information</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!editing}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={profile.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={profile.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={profile.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={profile.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={!editing}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Employment Information</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Occupation"
                value={profile.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Monthly Income (₹)"
                value={profile.monthlyIncome || ''}
                onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                disabled={!editing}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Emergency Contact</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={profile.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={profile.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                disabled={!editing}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
