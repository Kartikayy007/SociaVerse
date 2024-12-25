import { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface JoinSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JoinSpaceModal = ({ isOpen, onClose, onSuccess }: JoinSpaceModalProps) => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:4000/api/v1/spaces/join-by-code/${code.trim().toUpperCase()}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setShowSuccess(true);
      onSuccess();
      setCode('');
      const spaceId = response.data.data._id;
      router.push(`/space/${spaceId}`);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join space');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    onClose();
  };

  return (
    <>
      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: '#1a1a1a',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'white' }}>
            Join Space with Code
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Invite Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              required
              inputProps={{ maxLength: 6 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  textTransform: 'uppercase'
                },
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                mt: 2,
                backgroundColor: '#6366f1',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#4f46e5',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(99, 102, 241, 0.5)',
                  color: 'rgba(255, 255, 255, 0.5)',
                }
              }}
              disabled={loading || !code}
            >
              {loading ? 'Joining...' : 'Join Space'}
            </Button>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={showSuccess}
        autoHideDuration={1500}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Successfully joined space!
        </Alert>
      </Snackbar>
    </>
  );
};

export default JoinSpaceModal;