const homeFor = (user) => {
  if (!user) {
    return '/upload';
  }

  if (user.role === 'doctor') {
    return '/doctor/profile';
  }

  if (user.role === 'admin') {
    return '/admin/doctors';
  }

  return '/upload';
};

export { homeFor };