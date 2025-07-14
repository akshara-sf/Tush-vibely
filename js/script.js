const SUPABASE_URL = 'https://vegpytbffidrfocatkth.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3B5dGJmZmlkcmZvY2F0a3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzAxMzAsImV4cCI6MjA2NzkwNjEzMH0.iSvXSSQ9yIlk30tkCSVfPcAPUoRQvkea76XQjFP23EI'; // Replace with your Supabase anon key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'public' } });

// Static posts array (copied from blog.js for consistency)
const staticPosts = [
  {
    title: 'Mastering CSS Grid Layout',
    content: 'Learn how to create complex responsive layouts with CSS Grid, the powerful layout system that\'s changing the way we design for the web.',
    author: 'VibelyCode Team',
    created_at: '2025-05-28T00:00:00Z',
    category: 'HTML & CSS',
    read_time: '8 min read'
  },
  {
    title: 'Modern JavaScript: ES6+ Features You Should Know',
    content: 'Explore the most useful ES6+ features that will make your JavaScript code cleaner, more readable, and more efficient.',
    author: 'VibelyCode Team',
    created_at: '2025-05-20T00:00:00Z',
    category: 'JavaScript',
    read_time: '10 min read'
  },
  {
    title: 'Getting Started with React Hooks',
    content: 'A comprehensive guide to React Hooks and how they can simplify your functional components and state management.',
    author: 'VibelyCode Team',
    created_at: '2025-05-12T00:00:00Z',
    category: 'Frameworks',
    read_time: '12 min read'
  },
  {
    title: 'Essential VS Code Extensions for Web Developers',
    content: 'Boost your productivity with these must-have VS Code extensions for web development in 2025.',
    author: 'VibelyCode Team',
    created_at: '2025-05-05T00:00:00Z',
    category: 'Tools',
    read_time: '6 min read'
  },
  {
    title: 'Creating Smooth CSS Animations',
    content: 'Learn how to create performant and engaging animations using pure CSS with these practical examples.',
    author: 'VibelyCode Team',
    created_at: '2025-04-28T00:00:00Z',
    category: 'CSS',
    read_time: '9 min read'
  },
  {
    title: 'JavaScript Performance Optimization Techniques',
    content: 'Discover advanced techniques to optimize your JavaScript code for better performance and user experience.',
    author: 'VibelyCode Team',
    created_at: '2025-04-20T00:00:00Z',
    category: 'JavaScript',
    read_time: '11 min read'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing main page functionality');

  let selectedCategory = 'all'; // Default filter: show all posts

  // Category filter buttons
  const categoryButtons = document.querySelectorAll('.category-filter');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      console.log('Category filter clicked:', button.dataset.category);
      // Remove active state from all buttons
      categoryButtons.forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
      });
      // Add active state to clicked button
      button.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
      button.classList.add('bg-primary', 'text-white');
      // Update selected category and reload posts
      selectedCategory = button.dataset.category;
      loadPosts(selectedCategory);
    });
  });

  // Load and display posts
  async function loadPosts(categoryFilter = 'all') {
    console.log('Loading posts with filter:', categoryFilter);
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) {
      console.error('Posts container not found');
      return;
    }

    try {
      // Fetch dynamic posts from Supabase (limit to 4)
      let query = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(4);
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      const { data: dynamicPosts, error } = await query;

      if (error) {
        console.error('Fetch failed:', error.message);
        postsContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Failed to load posts. Displaying static posts only.</p>';
        displayPosts(staticPosts, postsContainer, categoryFilter);
        return;
      }

      // Log dynamic posts for debugging
      console.log('Dynamic posts fetched:', dynamicPosts);

      // Merge static and dynamic posts
      const allPosts = [
        ...staticPosts.map(post => ({
          ...post,
          isStatic: true
        })),
        ...dynamicPosts.map(post => ({
          ...post,
          isStatic: false
        }))
      ];

      // Filter by category if not 'all'
      const filteredPosts = categoryFilter === 'all' ? allPosts : allPosts.filter(post => post.category === categoryFilter);

      // Sort by created_at (newest first) and limit to 4
      filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const recentPosts = filteredPosts.slice(0, 4);

      // Display posts
      displayPosts(recentPosts, postsContainer, categoryFilter);
    } catch (err) {
      console.error('Unexpected error while loading posts:', err);
      postsContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">An unexpected error occurred while loading posts.</p>';
      displayPosts(staticPosts.slice(0, 4), postsContainer, categoryFilter);
    }
  }

  function displayPosts(posts, postsContainer, categoryFilter) {
    postsContainer.innerHTML = ''; // Clear existing content

    if (posts.length === 0) {
      postsContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 col-span-full">No posts ${categoryFilter === 'all' ? '' : `in ${categoryFilter}`} yet. Check back later!</p>`;
      return;
    }

    posts.forEach((post) => {
      console.log('Rendering post:', post.title);
      const card = document.createElement('article');
      card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow p-6';
      
      // Determine category badge color
      const categoryColors = {
        'HTML & CSS': 'bg-primary',
        'JavaScript': 'bg-blue-500',
        'Frameworks': 'bg-green-500',
        'Tools': 'bg-purple-500',
        'CSS': 'bg-yellow-500'
      };
      const categoryColor = categoryColors[post.category] || 'bg-gray-500';

      card.innerHTML = `
        <div class="relative">
          <span class="absolute top-0 left-0 ${categoryColor} text-white text-xs px-3 py-1 rounded-full">${post.category || 'Uncategorized'}</span>
        </div>
        <div class="pt-6">
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span>${new Date(post.created_at).toLocaleDateString()}</span>
            ${post.read_time ? `<span class="mx-2">•</span><span>${post.read_time}</span>` : ''}
          </div>
          <h2 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">${post.title}</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">${post.content}</p>
          <p class="text-sm text-gray-400">By ${post.author || 'Anonymous'}</p>
          <a href="blog.html" class="text-primary font-medium hover:underline inline-flex items-center mt-2">
            Read More
            <i class="fas fa-arrow-right ml-2 text-sm"></i>
          </a>
        </div>
      `;
      postsContainer.appendChild(card);
    });
  }

  // Initial load
  loadPosts('all');
});