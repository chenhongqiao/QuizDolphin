module.exports = {
  title: 'Quiz Dolphin',
  description: 'Quiz Dolphin Documentation',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Admin', link: '/admin/' },
      { text: 'User', link: '/user/' }
    ],
    sidebar: {
      '/user/': [
        '',
        'Homepage',
        'View-Quiz',
        'Taking-Quiz',
        'Review-Result',
        'History-View',
        'Progress-View'
      ],
      '/admin/': [
        '',
        'Admin-Home',
        'Quiz-Management',
        'History-View',
        'Progress-View',
        'User-Management'
      ],
    },
    base: '/QuizDolphin/'
  }
}

