import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/rest';
import './index.css';
import profileImage from './images/profile.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faRocket, 
  faLightbulb, 
  faLaptopCode, 
  faCode, 
  faStar, 
  faCodeBranch,
  faArrowUpRightFromSquare,
  faEnvelope,
  faPhone,
  faPaperPlane,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';

import {
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

interface Commit {
  sha: string;
  message: string;
  date: string;
  author: {
    name: string;
    avatar_url: string;
  };
}

interface Repository {
  name: string;
  description: string | null;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  commits: Commit[];
}

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  techStack: string[];
  githubLink: string;
  liveLink?: string;
}



const App: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference if no saved theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const token = import.meta.env.VITE_GITHUB_TOKEN;
        
        if (!token) {
          throw new Error('GitHub token not found. Please add VITE_GITHUB_TOKEN to your environment variables.');
        }

        const response = await fetch("https://api.github.com/users/Uvindu2002/repos", {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-App'
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
          }
          throw new Error('Failed to fetch repositories');
        }

        const data = await response.json();

        // Fetch commits for each repository
        const reposWithCommits = await Promise.all(data.map(async (repo: any): Promise<Repository> => {
          try {
            const commitsResponse = await fetch(
              `https://api.github.com/repos/Uvindu2002/${repo.name}/commits?per_page=3`,
              {
                headers: {
                  'Authorization': `token ${token}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'Portfolio-App'
                }
              }
            );

            let commits: Commit[] = [];
            if (commitsResponse.ok) {
              const commitsData = await commitsResponse.json();
              commits = commitsData.map((commit: any) => ({
                sha: commit.sha.substring(0, 7),
                message: commit.commit.message,
                date: new Date(commit.commit.author.date).toLocaleDateString(),
                author: {
                  name: commit.commit.author.name,
                  avatar_url: commit.author?.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                }
              }));
            }

            return {
              name: repo.name,
              description: repo.description,
              html_url: repo.html_url,
              language: repo.language,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              topics: repo.topics || [],
              commits
            };
          } catch (error) {
            console.error(`Error fetching commits for ${repo.name}:`, error);
            return {
              name: repo.name,
              description: repo.description,
              html_url: repo.html_url,
              language: repo.language,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              topics: repo.topics || [],
              commits: []
            };
          }
        }));

        setRepositories(reposWithCommits);
        setError(null);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch repositories');
        // Set some default repositories for demo purposes
        setRepositories([
          {
            name: "Portfolio Website",
            description: "My personal portfolio website built with React and TypeScript",
            html_url: "https://github.com/Uvindu2002/portfolio",
            language: "TypeScript",
            stargazers_count: 0,
            forks_count: 0,
            topics: ["react", "typescript", "tailwindcss"],
            commits: [
              {
                sha: "abc1234",
                message: "Initial commit",
                date: new Date().toLocaleDateString(),
                author: {
                  name: "Uvindu Pramuditha",
                  avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                }
              }
            ]
          },
          {
            name: "Data Science Projects",
            description: "Collection of data science and machine learning projects",
            html_url: "https://github.com/Uvindu2002/data-science-projects",
            language: "Python",
            stargazers_count: 0,
            forks_count: 0,
            topics: ["python", "machine-learning", "data-science"],
            commits: [
              {
                sha: "def5678",
                message: "Add initial project structure",
                date: new Date().toLocaleDateString(),
                author: {
                  name: "Uvindu Pramuditha",
                  avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                }
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  // Get unique languages from repositories
  const languages = ['All', ...new Set(repositories.map(repo => repo.language).filter(Boolean))];

  // Filter repositories based on selected language
  const filteredRepositories = selectedLanguage === 'All' 
    ? repositories 
    : repositories.filter(repo => repo.language === selectedLanguage);

  // Color mapping for programming languages
  const languageColors: { [key: string]: string } = {
    JavaScript: 'bg-yellow-400',
    TypeScript: 'bg-blue-400',
    Python: 'bg-green-400',
    Java: 'bg-red-400',
    PHP: 'bg-purple-400',
    HTML: 'bg-orange-400',
    CSS: 'bg-pink-400',
    // Add more languages as needed
  };

  // Add system preference listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Update theme in local storage and HTML class
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Add transition class to body
    document.body.classList.add('transition-colors', 'duration-300');
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme toggle function with smooth transition
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      document.body.classList.remove('transition-colors', 'duration-300');
    }, 300);
  };

  return (
    <div className={`font-sans transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
    }`}>
      <header className={`fixed w-full top-0 transition-all duration-300 z-50 ${
        isScrolled 
          ? isDarkMode 
            ? 'bg-gray-800/80 backdrop-blur-md shadow-lg'
            : 'bg-white/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}>
        <nav className="flex justify-between items-center p-4 max-w-6xl mx-auto relative">
          <h1 className={`text-2xl font-bold transition-colors duration-300 ${
            isScrolled 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-white'
          } hover:scale-105 transform cursor-pointer`}>
            Uvindu Pramuditha
          </h1>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            <div className={`w-6 h-5 relative transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`}>
              <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'
              }`}></span>
              <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 translate-y-2 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 translate-y-2' : 'translate-y-4'
              }`}></span>
            </div>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {['About', 'Skills', 'Projects', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`relative group transition-colors duration-300 ${
                  isScrolled 
                    ? isDarkMode 
                      ? 'text-gray-300 hover:text-green-400' 
                      : 'text-gray-600 hover:text-green-600'
                    : 'text-white hover:text-green-200'
                }`}
              >
                <span className="block">{item}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                isScrolled
                  ? isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div className={`${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } md:hidden transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800`}>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {['About', 'Skills', 'Projects', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 text-center ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-green-400'
                    : 'text-gray-600 hover:text-green-600'
                } transition-colors duration-300 text-lg`}
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full mt-4 py-3 rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } transition-colors duration-300 text-lg flex items-center justify-center gap-2`}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <section id="home" className={`min-h-screen relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-b from-green-900 via-green-800 to-green-700'
      } text-white transition-colors duration-300`}>
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className={`absolute w-96 h-96 -top-48 -left-16 ${
            isDarkMode ? 'bg-green-900/30' : 'bg-green-400/30'
          } rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob`}></div>
          <div className={`absolute w-96 h-96 top-48 -right-16 ${
            isDarkMode ? 'bg-green-800/30' : 'bg-green-200/30'
          } rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000`}></div>
          <div className={`absolute w-96 h-96 bottom-48 left-1/3 ${
            isDarkMode ? 'bg-green-700/30' : 'bg-green-300/30'
          } rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000`}></div>
        </div>

        {/* Moving stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`star ${
                isDarkMode ? 'bg-white' : 'bg-green-200'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.3
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="relative inline-block">
                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent animate-fade-in">
                    Hi, I'm Uvindu
                  </h1>
                  <div className={`absolute -bottom-2 left-0 w-full h-1 ${
                    isDarkMode ? 'bg-green-400/50' : 'bg-green-200/50'
                  } rounded-full animate-pulse`}></div>
                </div>
                <p className="text-xl md:text-2xl text-green-100 animate-fade-in-up">
                  BSc (Hons) Data Science Undergraduate
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start animate-fade-in-up animation-delay-200">
                {['Full Stack Developer', 'Data Scientist', 'Data Engineer', 'Cloud Engineer'].map((role, index) => (
                  <span
                    key={role}
                    className={`px-4 py-2 ${
                      isDarkMode 
                        ? 'bg-white/10 hover:bg-white/20' 
                        : 'bg-white/20 hover:bg-white/30'
                    } backdrop-blur-sm rounded-full text-sm font-medium border border-white/20 hover:scale-105 transition-all duration-300 cursor-default`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    {role}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start animate-fade-in-up animation-delay-400">
                {['Full Stack Development', 'Big Data', 'Cloud Computing', 'AI/ML'].map((skill, index) => (
                  <span
                    key={skill}
                    className={`px-4 py-2 ${
                      isDarkMode 
                        ? 'bg-green-600/30 hover:bg-green-600/40' 
                        : 'bg-green-500/30 hover:bg-green-500/40'
                    } rounded-full text-sm font-medium hover:scale-105 transition-all duration-300 cursor-default`}
                    style={{ animationDelay: `${400 + index * 200}ms` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <p className={`text-lg ${
                isDarkMode ? 'text-green-100' : 'text-green-50'
              } animate-fade-in-up animation-delay-600`}>
                Transforming ideas into reality through code and data-driven solutions
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start animate-fade-in-up animation-delay-800">
                <a
                  href="#contact"
                  className={`group relative px-8 py-3 ${
                    isDarkMode 
                      ? 'bg-white text-green-700 hover:bg-green-50' 
                      : 'bg-white text-green-600 hover:bg-green-50'
                  } rounded-full font-semibold overflow-hidden transition-all duration-300 hover:scale-105`}
                >
                  <span className="absolute inset-0 bg-green-100 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                  <span className="relative flex items-center gap-2">
                    Contact Me
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
                <a
                  href="#projects"
                  className={`group px-8 py-3 border-2 ${
                    isDarkMode 
                      ? 'border-white hover:bg-white/10' 
                      : 'border-white hover:bg-white/20'
                  } text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                >
                  View Projects
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right side - Profile Image */}
            <div className="relative group">
              {/* Animated gradient rings */}
              <div className="absolute -inset-4">
                <div className={`absolute inset-0 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-green-400 to-green-300' 
                    : 'bg-gradient-to-r from-green-300 to-green-200'
                } rounded-full opacity-75 group-hover:opacity-100 blur transition-all duration-500 animate-spin-slow`}></div>
                <div className={`absolute inset-2 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-green-500 to-green-400' 
                    : 'bg-gradient-to-r from-green-400 to-green-300'
                } rounded-full opacity-50 group-hover:opacity-75 blur transition-all duration-500 animate-spin-slow-reverse`}></div>
                <div className={`absolute inset-4 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-green-600 to-green-500' 
                    : 'bg-gradient-to-r from-green-500 to-green-400'
                } rounded-full opacity-25 group-hover:opacity-50 blur transition-all duration-500 animate-spin-slow`}></div>
              </div>

              <div className="relative">
                {/* Profile image container */}
                <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 ${
                  isDarkMode 
                    ? 'border-white/50 hover:border-white/70' 
                    : 'border-white/70 hover:border-white/90'
                } shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-3`}>
                  {/* Image overlay gradient */}
                  <div className={`absolute inset-0 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-green-400/20 via-transparent to-green-600/20' 
                      : 'bg-gradient-to-br from-green-300/20 via-transparent to-green-500/20'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Glowing effect */}
                  <div className={`absolute inset-0 ${
                    isDarkMode 
                      ? 'bg-green-400/10' 
                      : 'bg-green-300/10'
                  } opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}></div>
                  
                  <img 
                    src={profileImage} 
                    alt="Uvindu Pramuditha" 
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Decorative elements */}
                <div className={`absolute -top-4 -right-4 w-8 h-8 ${
                  isDarkMode 
                    ? 'bg-green-400/20' 
                    : 'bg-green-300/20'
                } rounded-full animate-pulse`}></div>
                <div className={`absolute -bottom-4 -left-4 w-6 h-6 ${
                  isDarkMode 
                    ? 'bg-green-500/20' 
                    : 'bg-green-400/20'
                } rounded-full animate-pulse animation-delay-1000`}></div>

                {/* Connect badge */}
                <div className={`absolute -bottom-4 -right-4 ${
                  isDarkMode 
                    ? 'bg-white/90 hover:bg-white' 
                    : 'bg-white/80 hover:bg-white/90'
                } backdrop-blur-sm text-green-600 px-6 py-2 rounded-full font-semibold shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl cursor-pointer hover:rotate-3`}>
                  <div className="flex items-center gap-2">
                    <span className="animate-wave inline-block">👋</span>
                    <span>Let's Connect!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <a href="#about" className={`flex flex-col items-center ${
              isDarkMode 
                ? 'text-white/80 hover:text-white' 
                : 'text-white/90 hover:text-white'
            } transition-colors`}>
              <span className="text-sm mb-2">Scroll Down</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section id="about" className={`py-20 relative overflow-hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50'
            : 'bg-gradient-to-br from-green-50/50 via-white to-green-50/50'
        } opacity-50`}></div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <h2 className={`text-5xl font-bold mb-16 text-center ${
            isDarkMode
              ? 'bg-gradient-to-r from-green-400 to-green-200 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent'
          }`}>
            About My Journey
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative">
              <div className={`absolute -inset-4 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-green-900/50 to-green-800/50'
                  : 'bg-gradient-to-r from-green-200 to-green-100'
              } rounded-2xl transform -rotate-6 opacity-50`}></div>
              <div className={`relative ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-100 border border-gray-700'
                  : 'bg-white text-gray-800 border border-gray-100'
              } p-8 rounded-xl shadow-xl transition-colors duration-300`}>
                <span className="absolute -top-8 -left-8 text-7xl opacity-10">🚀</span>
                <h3 className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>The Tech Explorer</h3>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                } leading-relaxed`}>
                  I'm a passionate Data Science enthusiast on a mission to transform complex data into meaningful insights. With a blend of analytical thinking and creative problem-solving, I craft innovative solutions that make a difference.
                </p>
                <div className="mt-6 flex gap-3">
                  {['Data Science', 'Analytics', 'ML/AI'].map((tag) => (
                    <span key={tag} className={`px-4 py-2 ${
                      isDarkMode 
                        ? 'bg-gray-700 text-green-400 hover:bg-gray-600'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    } rounded-full text-sm font-medium transition-colors duration-300`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  icon: faCode,
                  title: 'Full Stack Dev',
                  description: 'Building scalable applications from front to back'
                },
                {
                  icon: faLightbulb,
                  title: 'Problem Solver',
                  description: 'Turning complex challenges into elegant solutions'
                },
                {
                  icon: faRocket,
                  title: 'Quick Learner',
                  description: 'Adaptable and always eager to explore new technologies'
                },
                {
                  icon: faLaptopCode,
                  title: 'Team Player',
                  description: 'Collaborating to create impactful solutions'
                }
              ].map((item, index) => (
                <div key={item.title} className={`transform hover:scale-105 transition-all duration-300 ${
                  index % 2 === 1 ? 'translate-y-6' : ''
                }`}>
                  <div className={`${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                      : 'bg-white hover:bg-gray-50 border-gray-100'
                  } p-6 rounded-xl shadow-lg h-full hover:shadow-2xl transition-all duration-300 border`}>
                    <div className={`w-12 h-12 ${
                      isDarkMode 
                        ? 'bg-gray-700 text-green-400'
                        : 'bg-green-100 text-green-600'
                    } rounded-full flex items-center justify-center mb-4 transition-colors duration-300`}>
                      <FontAwesomeIcon icon={item.icon} className="w-6 h-6" />
                    </div>
                    <h4 className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>{item.title}</h4>
                    <p className={`${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    } text-sm`}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`relative ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-900 to-green-800'
              : 'bg-gradient-to-r from-green-600 to-green-400'
          } p-12 rounded-2xl text-white transition-colors duration-300`}>
            <div className="absolute inset-0 bg-white opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="relative">
              <h3 className="text-3xl font-bold mb-6">My Philosophy</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Learn',
                    description: 'Continuously expanding my knowledge and staying current with emerging technologies.'
                  },
                  {
                    title: 'Create',
                    description: 'Building innovative solutions that solve real-world problems effectively.'
                  },
                  {
                    title: 'Share',
                    description: 'Contributing to the community and helping others grow in their journey.'
                  }
                ].map((item) => (
                  <div key={item.title}>
                    <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                    <p className="text-green-50">{item.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <a 
                  href="#projects" 
                  className={`px-6 py-3 ${
                    isDarkMode 
                      ? 'bg-white text-green-900 hover:bg-green-50'
                      : 'bg-white text-green-600 hover:bg-green-50'
                  } rounded-full font-semibold transition-colors flex items-center gap-2 cursor-pointer`}
                >
                  <FontAwesomeIcon icon={faRocket} className="w-5 h-5" />
                  View My Work
                </a>
                <a 
                  href="#contact"
                  className={`px-6 py-3 ${
                    isDarkMode 
                      ? 'bg-green-800 text-white hover:bg-green-700'
                      : 'bg-green-700 text-white hover:bg-green-800'
                  } rounded-full font-semibold transition-colors flex items-center gap-2 cursor-pointer`}
                >
                  <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className={`bg-gradient-to-b ${
        isDarkMode
          ? 'from-gray-900 to-gray-800'
          : 'from-gray-50 to-white'
      } p-8 transition-colors duration-300`}>
        <div className="max-w-5xl mx-auto">
          <h3 className={`text-4xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            <span className={`bg-gradient-to-r ${
              isDarkMode
                ? 'from-green-400 to-green-200'
                : 'from-green-600 to-green-400'
            } bg-clip-text text-transparent`}>My Skills</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Frontend Development',
                icon: '💻',
                skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'HTML5', 'CSS3']
              },
              {
                title: 'Backend Development',
                icon: '⚙️',
                skills: ['Node.js', 'Python', 'Java', 'Express.js', 'Django', 'Spring Boot']
              },
              {
                title: 'Database & Cloud',
                icon: '🗄️',
                skills: ['MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Redis']
              },
              {
                title: 'Data Science',
                icon: '📊',
                skills: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn']
              },
              {
                title: 'DevOps & Tools',
                icon: '🛠️',
                skills: ['Git', 'CI/CD', 'Jenkins', 'Linux', 'Nginx', 'Apache']
              },
              {
                title: 'Soft Skills',
                icon: '🤝',
                skills: ['Problem Solving', 'Team Leadership', 'Communication', 'Agile', 'Time Management']
              }
            ].map((category) => (
              <div key={category.title} className={`${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
              } p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden`}>
                <div className={`absolute inset-0 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600'
                    : 'bg-gradient-to-r from-green-50 to-green-100'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-green-500 to-green-700'
                        : 'bg-gradient-to-br from-green-400 to-green-600'
                    } rounded-full mx-auto flex items-center justify-center text-white text-3xl transform group-hover:rotate-12 transition-transform duration-500 shadow-lg`}>
                      <span className="transform group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </span>
                    </div>
                    <h4 className={`text-2xl font-bold mt-4 mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>{category.title}</h4>
                    <div className={`h-1 w-16 bg-gradient-to-r ${
                      isDarkMode
                        ? 'from-green-500 to-green-700'
                        : 'from-green-400 to-green-600'
                    } mx-auto rounded-full`}></div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {category.skills.map((skill) => (
                      <span key={skill} className={`px-4 py-2 ${
                        isDarkMode
                          ? 'bg-gray-700 text-green-400 border-gray-600 hover:bg-gray-600'
                          : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:bg-green-100'
                      } rounded-full text-sm font-medium hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer border`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skill Level Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-100'
            } p-6 rounded-xl shadow-lg border transition-colors duration-300`}>
              <h4 className={`text-xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Technical Expertise</h4>
              {[
                { name: 'Frontend Development', level: 90 },
                { name: 'Backend Development', level: 85 },
                { name: 'Database Management', level: 80 },
                { name: 'Cloud Services', level: 75 }
              ].map((skill) => (
                <div key={skill.name} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{skill.name}</span>
                    <span className={`${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>{skill.level}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        isDarkMode
                          ? 'from-green-500 to-green-700'
                          : 'from-green-400 to-green-600'
                      } transition-all duration-500`}
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-100'
            } p-6 rounded-xl shadow-lg border transition-colors duration-300`}>
              <h4 className={`text-xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Soft Skills</h4>
              {[
                { name: 'Problem Solving', level: 95 },
                { name: 'Team Leadership', level: 85 },
                { name: 'Communication', level: 90 },
                { name: 'Time Management', level: 85 }
              ].map((skill) => (
                <div key={skill.name} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{skill.name}</span>
                    <span className={`${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>{skill.level}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        isDarkMode
                          ? 'from-green-500 to-green-700'
                          : 'from-green-400 to-green-600'
                      } transition-all duration-500`}
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className={`bg-gradient-to-b ${
        isDarkMode
          ? 'from-gray-800 to-gray-900'
          : 'from-white to-gray-50'
      } py-16 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className={`bg-gradient-to-r ${
              isDarkMode
                ? 'from-green-400 to-green-200'
                : 'from-green-600 to-green-400'
            } bg-clip-text text-transparent`}>
              Featured Projects
            </span>
          </h2>

          {/* Filter buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['All', ...new Set(repositories.map(repo => repo.language).filter(Boolean))].map((language) => (
              <button
                key={language}
                onClick={() => setProjectFilter(language)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  projectFilter === language
                    ? isDarkMode
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-green-600 text-white shadow-lg scale-105'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-green-400 border border-gray-700'
                      : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200'
                }`}
              >
                {language}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className={`w-16 h-16 border-4 ${
                isDarkMode
                  ? 'border-green-400 border-t-gray-800'
                  : 'border-green-400 border-t-transparent'
              } rounded-full animate-spin`}></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className={`${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              } mb-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-lg font-semibold">{error}</p>
              </div>
              <p className={`${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Showing demo repositories instead. Please try again later.
              </p>
            </div>
          ) : repositories.length === 0 ? (
            <div className="text-center py-16">
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>No repositories found</p>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  const container = document.querySelector('.project-scroll-container');
                  if (container) {
                    container.scrollLeft -= 400;
                  }
                }}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 ${
                  isDarkMode
                    ? 'bg-gray-800/80 hover:bg-gray-700 text-green-400'
                    : 'bg-white/80 hover:bg-white text-green-600'
                } p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 backdrop-blur-sm`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const container = document.querySelector('.project-scroll-container');
                  if (container) {
                    container.scrollLeft += 400;
                  }
                }}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 ${
                  isDarkMode
                    ? 'bg-gray-800/80 hover:bg-gray-700 text-green-400'
                    : 'bg-white/80 hover:bg-white text-green-600'
                } p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 backdrop-blur-sm`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className={`absolute left-0 top-0 h-full w-24 bg-gradient-to-r ${
                isDarkMode ? 'from-gray-900' : 'from-white'
              } to-transparent z-10 pointer-events-none`}></div>
              <div className={`absolute right-0 top-0 h-full w-24 bg-gradient-to-l ${
                isDarkMode ? 'from-gray-900' : 'from-white'
              } to-transparent z-10 pointer-events-none`}></div>
              <div className="overflow-x-auto pb-4 hide-scrollbar project-scroll-container scroll-smooth">
                <div className="flex gap-6 min-w-max px-4">
                  {repositories
                    .filter(repo => projectFilter === 'All' || repo.language === projectFilter)
                    .map((repo) => (
                      <a
                        key={repo.name}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-[380px] group"
                      >
                        <div className={`${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                            : 'bg-white hover:bg-gray-50 border-gray-100'
                        } rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 h-full border`}>
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className={`text-xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-800'
                              } truncate flex-1`}>{repo.name}</h3>
                              {repo.language && (
                                <span className={`px-3 py-1 ${
                                  isDarkMode
                                    ? 'bg-gray-700 text-green-400'
                                    : 'bg-green-50 text-green-700'
                                } rounded-full text-sm ml-2`}>
                                  {repo.language}
                                </span>
                              )}
                            </div>
                            
                            <p className={`${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            } mb-4 line-clamp-2`}>
                              {repo.description || 'No description available'}
                            </p>

                            {repo.topics && repo.topics.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {repo.topics.map((topic) => (
                                  <span
                                    key={topic}
                                    className={`px-2 py-1 ${
                                      isDarkMode
                                        ? 'bg-gray-700 text-green-400'
                                        : 'bg-green-50 text-green-700'
                                    } rounded-full text-xs`}
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className={`space-y-2 mb-4 ${
                              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                            } rounded-lg p-3`}>
                              {repo.commits.map((commit) => (
                                <div key={commit.sha} className="flex items-start gap-2">
                                  <img
                                    src={commit.author.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                                    alt={commit.author.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    } truncate`}>{commit.message}</p>
                                    <p className={`text-xs ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                    }`}>{commit.date} • {commit.sha}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faStar} className={`w-4 h-4 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                  }`} />
                                  <span className={`${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>{repo.stargazers_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faCodeBranch} className={`w-4 h-4 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                  }`} />
                                  <span className={`${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>{repo.forks_count}</span>
                                </div>
                              </div>
                              <FontAwesomeIcon 
                                icon={faArrowUpRightFromSquare} 
                                className={`w-4 h-4 ${
                                  isDarkMode 
                                    ? 'text-gray-400 group-hover:text-green-400'
                                    : 'text-gray-400 group-hover:text-green-600'
                                } transition-colors`}
                              />
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="contact" className={`bg-gradient-to-b ${
        isDarkMode
          ? 'from-gray-900 to-gray-800'
          : 'from-gray-50 to-white'
      } p-8 transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto">
          <h3 className={`text-4xl font-bold mb-12 text-center ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            <span className={`bg-gradient-to-r ${
              isDarkMode
                ? 'from-green-400 to-green-200'
                : 'from-green-600 to-green-400'
            } bg-clip-text text-transparent`}>Get In Touch</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className={`${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                  : 'bg-white hover:bg-gray-50 border-gray-100'
              } p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 border`}>
                <h4 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Contact Information</h4>
                <div className="space-y-4">
                  <div className={`flex items-center gap-4 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-green-400' 
                      : 'text-gray-600 hover:text-green-600'
                  } transition-colors group`}>
                    <div className={`w-12 h-12 ${
                      isDarkMode 
                        ? 'bg-gray-700 group-hover:bg-gray-600' 
                        : 'bg-green-50 group-hover:bg-green-100'
                    } rounded-lg flex items-center justify-center transition-colors`}>
                      <FontAwesomeIcon icon={faEnvelope} className={`w-6 h-6 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>Email</p>
                      <a href="mailto:wup0327@gmail.com" className={`${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      } hover:underline`}>wup0327@gmail.com</a>
                    </div>
                  </div>
                  <div className={`flex items-center gap-4 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-green-400' 
                      : 'text-gray-600 hover:text-green-600'
                  } transition-colors group`}>
                    <div className={`w-12 h-12 ${
                      isDarkMode 
                        ? 'bg-gray-700 group-hover:bg-gray-600' 
                        : 'bg-green-50 group-hover:bg-green-100'
                    } rounded-lg flex items-center justify-center transition-colors`}>
                      <FontAwesomeIcon icon={faPhone} className={`w-6 h-6 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>Phone</p>
                      <a href="tel:+94771855466" className={`${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      } hover:underline`}>+94 771855466</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className={`${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                  : 'bg-white hover:bg-gray-50 border-gray-100'
              } p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border`}>
                <h4 className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Find Me Online</h4>
                <p className={`mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Follow me on social media to see my latest updates and projects.</p>
                <div className="space-y-4">
                  <a
                    href="https://github.com/Uvindu2002"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-green-400' 
                        : 'text-gray-600 hover:text-green-600'
                    } transition-colors group`}
                  >
                    <div className={`w-12 h-12 ${
                      isDarkMode 
                        ? 'bg-gray-700 group-hover:bg-gray-600' 
                        : 'bg-green-50 group-hover:bg-green-100'
                    } rounded-lg flex items-center justify-center transition-colors`}>
                      <FontAwesomeIcon icon={faGithub} className={`w-6 h-6 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>GitHub</p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>github.com/Uvindu2002</p>
                    </div>
                  </a>
                  
                  <a
                    href="http://www.linkedin.com/in/uvindu-pramuditha-72b92b237"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-green-400' 
                        : 'text-gray-600 hover:text-green-600'
                    } transition-colors group`}
                  >
                    <div className={`w-12 h-12 ${
                      isDarkMode 
                        ? 'bg-gray-700 group-hover:bg-gray-600' 
                        : 'bg-green-50 group-hover:bg-green-100'
                    } rounded-lg flex items-center justify-center transition-colors`}>
                      <FontAwesomeIcon icon={faLinkedin} className={`w-6 h-6 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>LinkedIn</p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>linkedin.com/in/uvindu-pramuditha</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className={`${
                isDarkMode
                  ? 'bg-gradient-to-br from-green-900 to-green-800'
                  : 'bg-gradient-to-br from-green-400 to-green-600'
              } p-6 rounded-xl shadow-lg text-white transition-colors duration-300`}>
                <h4 className="text-xl font-bold mb-2">Ready to Work Together?</h4>
                <p className="mb-4 opacity-90">Let's turn your ideas into reality!</p>
                <a
                  href="mailto:wup0327@gmail.com"
                  className={`inline-flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-white text-green-900 hover:bg-green-50'
                      : 'bg-white text-green-600 hover:bg-green-50'
                  } px-4 py-2 rounded-full font-semibold transition-colors`}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                  Send a Message
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className={`relative overflow-hidden ${
        isDarkMode
          ? 'bg-gray-900 text-gray-400'
          : 'bg-white text-gray-600'
      } transition-colors duration-300`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute w-96 h-96 -top-48 -right-16 ${
            isDarkMode ? 'bg-green-900/20' : 'bg-green-200/20'
          } rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob`}></div>
          <div className={`absolute w-96 h-96 -bottom-48 -left-16 ${
            isDarkMode ? 'bg-green-800/20' : 'bg-green-300/20'
          } rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000`}></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Quick Links</h4>
              <ul className="space-y-2">
                {['About', 'Skills', 'Projects', 'Contact'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className={`inline-block ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-green-400' 
                          : 'text-gray-600 hover:text-green-600'
                      } transition-colors duration-300 hover:translate-x-1 transform`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Contact Info</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} className={`w-4 h-4 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <a
                    href="mailto:wup0327@gmail.com"
                    className={`${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-green-400' 
                        : 'text-gray-600 hover:text-green-600'
                    } transition-colors duration-300`}
                  >
                    wup0327@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className={`w-4 h-4 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <a
                    href="tel:+94771855466"
                    className={`${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-green-400' 
                        : 'text-gray-600 hover:text-green-600'
                    } transition-colors duration-300`}
                  >
                    +94 771855466
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className={`w-4 h-4 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <span className={`${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Sri Lanka</span>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Connect With Me</h4>
              <div className="flex gap-4">
                <a
                  href="https://github.com/Uvindu2002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-green-400' 
                      : 'bg-gray-100 hover:bg-gray-200 text-green-600'
                  } transition-all duration-300 hover:scale-110 transform`}
                >
                  <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
                </a>
                <a
                  href="http://www.linkedin.com/in/uvindu-pramuditha-72b92b237"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-green-400' 
                      : 'bg-gray-100 hover:bg-gray-200 text-green-600'
                  } transition-all duration-300 hover:scale-110 transform`}
                >
                  <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-green-400' 
                      : 'bg-gray-100 hover:bg-gray-200 text-green-600'
                  } transition-all duration-300 hover:scale-110 transform`}
                >
                  <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
          } my-8`}></div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-500' : 'text-gray-600'
            }`}>
              &copy; {new Date().getFullYear()} Uvindu Pramuditha. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-500' : 'text-gray-600'
              }`}>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-500' : 'text-gray-600'
              }`}>using React & Tailwind</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
