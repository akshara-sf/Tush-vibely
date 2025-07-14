const SUPABASE_URL = 'https://vegpytbffidrfocatkth.supabase.co'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3B5dGJmZmlkcmZvY2F0a3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzAxMzAsImV4cCI6MjA2NzkwNjEzMH0.iSvXSSQ9yIlk30tkCSVfPcAPUoRQvkea76XQjFP23EI'; // Replace with your Supabase anon key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'public' } });

// Static posts array
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

const POSTS_PER_PAGE = 6; // Number of posts per page
let currentPage = 1; // Current page for pagination
let selectedCategory = 'all'; // Default filter: show all posts

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing blog functionality');

  // Toggle form visibility
  const toggleFormBtn = document.getElementById('toggle-form-btn');
  const postFormSection = document.getElementById('post-form-section');
  const submitBtn = document.getElementById('submit-btn');

  if (toggleFormBtn && postFormSection) {
    toggleFormBtn.addEventListener('click', () => {
      console.log('Toggle form button clicked');
      postFormSection.classList.toggle('hidden');
    });
  } else {
    console.error('Toggle form button or post form section not found');
  }

  // Form submission
  const postForm = document.getElementById('post-form');
  if (postForm) {
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submitted');

      const title = document.getElementById('title').value.trim();
      const content = document.getElementById('content').value.trim();
      const category = document.getElementById('category').value;
      const author = document.getElementById('author').value.trim() || 'Anonymous';

      if (!title || !content || !category) {
        alert('Title, Content, and Category are required!');
        return;
      }

      // Disable submit button to prevent multiple submissions
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        // Insert post into Supabase
        const postData = { title, content, category, author };
        console.log('Inserting post into Supabase:', postData);
        const { data, error } = await supabase.from('posts').insert([postData]).select();

        if (error) {
          console.error('Insert failed:', error);
          alert(`Failed to create post: ${error.message}`);
        } else {
          console.log('Post created:', data);
          alert('Post created successfully!');
          postForm.reset();
          postFormSection.classList.add('hidden'); // Hide form after submission
          currentPage = 1; // Reset to first page after new post
          await loadPosts(selectedCategory, currentPage); // Refresh posts with current filter
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred while creating the post.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    });
  } else {
    console.error('Post form not found');
  }

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
      // Update selected category and reset to first page
      selectedCategory = button.dataset.category;
      currentPage = 1;
      loadPosts(selectedCategory, currentPage);
    });
  });

  // Load and display posts
  async function loadPosts(categoryFilter = 'all', page = 1) {
    console.log('Loading posts with filter:', categoryFilter, 'Page:', page);
    const recentContainer = document.getElementById('recent-posts-container');
    const allContainer = document.getElementById('posts-container');
    const paginationContainer = document.getElementById('pagination-container');
    if (!recentContainer || !allContainer || !paginationContainer) {
      console.error('Posts containers or pagination container not found');
      return;
    }

    try {
      // Fetch dynamic posts from Supabase
      let query = supabase.from('posts').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      const { data: dynamicPosts, error, count } = await query;

      if (error) {
        console.error('Fetch failed:', error.message);
        recentContainer.innerHTML = '<p class="text-center text-red-500">Failed to load recent posts. Displaying static posts only.</p>';
        allContainer.innerHTML = '<p class="text-center text-red-500">Failed to load posts. Displaying static posts only.</p>';
        displayPosts(staticPosts, recentContainer, allContainer, categoryFilter, true);
        displayPosts(staticPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE), recentContainer, allContainer, categoryFilter, false);
        renderPagination(staticPosts.length, page, categoryFilter);
        return;
      }

      // Log dynamic posts for debugging
      console.log('Dynamic posts fetched:', dynamicPosts, 'Total count:', count);

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

      // Sort by created_at (newest first)
      filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Filter recent posts (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentPosts = filteredPosts.filter(post => new Date(post.created_at) >= oneWeekAgo);

      // Paginate filtered posts
      const totalPosts = filteredPosts.length;
      const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
      const paginatedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

      // Display posts
      displayPosts(recentPosts, recentContainer, allContainer, categoryFilter, true);
      displayPosts(paginatedPosts, recentContainer, allContainer, categoryFilter, false);

      // Render pagination
      renderPagination(totalPosts, page, categoryFilter);
    } catch (err) {
      console.error('Unexpected error while loading posts:', err);
      recentContainer.innerHTML = '<p class="text-center text-red-500">An unexpected error occurred while loading recent posts.</p>';
      allContainer.innerHTML = '<p class="text-center text-red-500">An unexpected error occurred while loading posts.</p>';
      displayPosts(staticPosts, recentContainer, allContainer, categoryFilter, true);
      displayPosts(staticPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE), recentContainer, allContainer, categoryFilter, false);
      renderPagination(staticPosts.length, page, categoryFilter);
    }
  }

  function displayPosts(posts, recentContainer, allContainer, categoryFilter, isRecent = false) {
    const container = isRecent ? recentContainer : allContainer;
    container.innerHTML = ''; // Clear existing content

    if (posts.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400">No ${isRecent ? 'recent' : ''} posts ${categoryFilter === 'all' ? '' : `in ${categoryFilter}`} yet${isRecent ? ' in the last week' : ''}. ${isRecent ? '' : 'Create one above!'}</p>`;
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
          <a href="#" class="text-primary font-medium hover:underline inline-flex items-center mt-2">
            Read More
            <i class="fas fa-arrow-right ml-2 text-sm"></i>
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function renderPagination(totalPosts, currentPage, categoryFilter) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = ''; // Clear existing pagination

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    if (totalPages <= 1) return; // No pagination needed for 1 page

    // Previous button
    const prevButton = document.createElement('a');
    prevButton.href = '#';
    prevButton.className = `px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    if (currentPage > 1) {
      prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage--;
        loadPosts(categoryFilter, currentPage);
      });
    }
    paginationContainer.appendChild(prevButton);

    // Numbered buttons (show up to 5 pages, with ellipsis if needed)
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      const firstPageButton = document.createElement('a');
      firstPageButton.href = '#';
      firstPageButton.className = 'px-3 py-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
      firstPageButton.textContent = '1';
      firstPageButton.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = 1;
        loadPosts(categoryFilter, currentPage);
      });
      paginationContainer.appendChild(firstPageButton);

      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'px-3 py-1 text-gray-500';
        ellipsis.textContent = '...';
        paginationContainer.appendChild(ellipsis);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('a');
      pageButton.href = '#';
      pageButton.className = `px-3 py-1 rounded-md ${i === currentPage ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`;
      pageButton.textContent = i;
      pageButton.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = i;
        loadPosts(categoryFilter, currentPage);
      });
      paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'px-3 py-1 text-gray-500';
        ellipsis.textContent = '...';
        paginationContainer.appendChild(ellipsis);
      }

      const lastPageButton = document.createElement('a');
      lastPageButton.href = '#';
      lastPageButton.className = 'px-3 py-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
      lastPageButton.textContent = totalPages;
      lastPageButton.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = totalPages;
        loadPosts(categoryFilter, currentPage);
      });
      paginationContainer.appendChild(lastPageButton);
    }

    // Next button
    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.className = `px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    if (currentPage < totalPages) {
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage++;
        loadPosts(categoryFilter, currentPage);
      });
    }
    paginationContainer.appendChild(nextButton);
  }

  // Initial load
  loadPosts('all', currentPage);
});