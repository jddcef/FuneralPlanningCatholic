# Catholic Funeral Planner

A comprehensive web application for planning Catholic funerals with hymn and reading selections, built with modern web technologies.

## ✨ New Features

### 🎨 Modern UI with Tailwind CSS
- Beautiful, responsive design with Catholic-themed color scheme
- Mobile-first responsive layout
- Smooth animations and hover effects
- Professional typography and spacing

### 🎵 Enhanced Hymn Selection
- 8 carefully selected Catholic funeral hymns
- Each hymn includes theme categorization
- YouTube video preview functionality
- Watch videos directly on the page or open in YouTube

### 📖 Comprehensive Reading Selection
- 16 readings across all categories (First Reading, Psalm, Second Reading, Gospel)
- Enhanced theme filtering system
- Full text content for each reading
- Semantic theme analysis using compromise.js

### 🎥 Video Integration
- Embedded YouTube video player
- Modal-based video viewing experience
- Responsive video container
- Easy access to hymn performances

### 🧠 Semantic Theme Analysis
- Uses compromise.js for natural language processing
- Automatically identifies themes in reading content
- Enhanced theme categorization for better organization
- Smart filtering based on emotional and spiritual themes

### 🧭 Expanded Site Structure
- **Home**: Welcome and quick start
- **Understanding**: Catholic funeral process explanation
- **Planning Tools**: Hymn and reading selection
- **Downloads**: Templates and resources
- **FAQ**: Common questions and answers
- **Contact**: Parish information and support

### 📱 Mobile-First Design
- Responsive navigation with mobile menu
- Touch-friendly interface elements
- Optimized for all device sizes
- Smooth scrolling navigation

## 🛠️ Technologies Used

- **jQuery 3.7.1**: Enhanced DOM manipulation and event handling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **compromise.js**: Natural language processing for semantic analysis
- **jsPDF**: PDF generation for funeral plans
- **YouTube API**: Video embedding and preview functionality

## 🚀 Getting Started

1. Clone the repository
2. Open `index.html` in a web browser
3. Navigate through the sections using the top navigation
4. Select hymns and readings for your funeral plan
5. Generate a PDF of your selections

## 📁 File Structure

```
├── index.html          # Main HTML file with new structure
├── css/
│   └── style.css      # Custom styles complementing Tailwind
├── js/
│   ├── app.js         # Main application logic (jQuery-based)
│   ├── hymns.js       # Hymn data with themes and YouTube links
│   └── readings.js    # Reading data with comprehensive content
└── README.md          # This documentation
```

## 🎯 Key Features

### Theme-Based Filtering
- Filter readings by emotional and spiritual themes
- Automatic theme detection using NLP
- Visual theme tags for easy identification

### Video Integration
- Watch hymn performances without leaving the page
- Responsive video modal
- Direct YouTube links as backup

### Enhanced User Experience
- Smooth scrolling navigation
- Persistent selections using localStorage
- Responsive design for all devices
- Professional Catholic aesthetic

## 🔧 Customization

### Adding New Hymns
Edit `js/hymns.js` to add new hymns with:
- Title and description
- YouTube URL
- Theme categorization
- Lyrics preview

### Adding New Readings
Edit `js/readings.js` to add new readings with:
- Biblical reference
- Full text content
- Theme categorization
- Reading type

### Styling
- Primary colors defined in Tailwind config
- Custom CSS in `css/style.css`
- Responsive breakpoints for mobile optimization

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Catholic liturgical texts and readings
- YouTube for video content
- Open source community for libraries and tools
- Catholic funeral planning resources and guidance
