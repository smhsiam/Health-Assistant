const homeFor = (user) => {
  if (!user) {
    return '/dashboard';
  }

  if (user.role === 'doctor') {
    return '/doctor/profile';
  }

  if (user.role === 'admin') {
    return '/admin/doctors';
  }

  return '/dashboard';
};

export { homeFor };