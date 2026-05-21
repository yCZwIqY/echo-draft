import toast from 'react-hot-toast';

export const showToast = (
  message: string,
  type: 'default' | 'success' | 'warning' | 'danger' = 'default',
) => {
  if (type === 'default') {
    toast(message, {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  }

  if (type === 'danger') {
    toast(message, {
      style: {
        borderRadius: '10px',
        background: '#ab3d3d',
        color: '#fff',
      },
    });
  }
};
