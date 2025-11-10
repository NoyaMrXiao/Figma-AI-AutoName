# Plugin Publishing Information

## Plugin Name
**AI Auto Naming**

## Tagline
**Automatically generate semantic, meaningful names for your Figma elements using AI**

## Short Description (for Figma Community)
Automatically generate semantic, meaningful names for your Figma elements using AI. Supports single elements, batch naming, and frame structure analysis with visual understanding.

## Full Description

### What it does
AI Auto Naming is an intelligent Figma plugin that uses AI technology to automatically generate semantic, meaningful names for your design elements. Save hours of manual work and maintain consistency across your design files with AI-powered naming suggestions.

### Key Features

**🤖 AI-Powered Naming**
- Automatically generates semantic names based on element type, description, and context
- Understands design patterns and suggests industry-standard naming conventions
- Learns from your design structure to provide contextual suggestions

**🖼️ Visual Analysis**
- Supports screenshot analysis - AI understands element appearance and functionality
- Uses GPT-4o vision model to analyze visual design elements
- Generates names that reflect both structure and visual appearance

**📦 Batch Processing**
- Process multiple frames and their children in one go
- Efficiently handle large design files with hundreds of elements
- Concurrent processing for faster results

**🎯 Frame Structure Analysis**
- Analyze entire frame structures and return all nodes that need naming
- Understands hierarchical relationships between elements
- Suggests names that maintain consistency across the design system

**🔍 Smart Recognition**
- Automatically identifies FRAME, COMPONENT, GROUP, BUTTON, INSTANCE, and more
- Handles complex component variants and instances
- Recognizes design patterns and suggests appropriate naming conventions

**💡 Context-Aware**
- Generates accurate names by understanding element descriptions, parent info, and sibling elements
- Considers design system context and naming patterns
- Provides reasoning for each naming suggestion

### Use Cases

- **Design System Maintenance**: Keep your design system organized with consistent naming
- **Component Library Management**: Automatically name components and variants
- **Design Handoff**: Prepare designs for development with semantic names
- **Team Collaboration**: Ensure everyone uses the same naming conventions
- **Large File Organization**: Quickly organize and name elements in complex design files

### How to Use

1. Select elements (Frame, Component, etc.) in Figma canvas
2. Run the plugin: `Plugins` > `AI Auto Naming`
3. Review AI-generated naming suggestions
4. Apply names with a single click

### Requirements

- Figma Desktop App or Figma in Browser
- Backend server running (see setup instructions)
- OpenAI API Key (configured on backend server)

### Technical Details

- Built with TypeScript and Figma Plugin API
- Uses OpenAI GPT-4o for AI-powered naming
- Supports dynamic page access for large files
- Network access required for AI service communication

## Keywords (for discovery)
- ai
- naming
- automation
- productivity
- design-tokens
- organization
- semantic-naming
- batch-rename
- frame-analysis
- design-system
- component-library
- auto-naming

## Version
2.0.0

## Author
[Your Name/Organization]

## Support
For issues, questions, or contributions, please visit the project repository.

## License
MIT

