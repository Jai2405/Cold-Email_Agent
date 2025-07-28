# Cold Email Agent - Multi-Agent System

A sophisticated AI-powered system for generating personalized internship cold emails using OpenAI's Agents SDK. This project demonstrates advanced agent collaboration with specialized agents for research, skills matching, email writing, and quality review.

## 🚀 Features

- **Multi-Agent Architecture**: Uses 4 specialized agents working together
- **Job Posting Analysis**: Automatically extracts key information from job postings
- **Skills Matching**: Matches your background to job requirements
- **Personalized Emails**: Generates friendly yet professional cold emails
- **Quality Review**: Ensures emails meet best practices
- **Trace Monitoring**: View agent workflows in OpenAI's trace dashboard

## 🏗️ Architecture

### Agents

1. **Research Agent** 🔍
   - Analyzes job postings
   - Extracts company info, role details, requirements
   - Identifies key talking points

2. **Skills Matcher** 🎯
   - Compares your background to job requirements
   - Identifies most relevant projects/experiences
   - Highlights transferable skills

3. **Email Writer** ✍️
   - Creates personalized email using research and skills analysis
   - Maintains friendly yet professional tone
   - Includes specific examples and connections

4. **Review Agent** ✅
   - Reviews email for quality and effectiveness
   - Suggests improvements if needed
   - Ensures best practices are followed

5. **Coordinator** 🎯
   - Orchestrates all agents in the correct order
   - Passes information between agents
   - Returns final polished email

## 📋 Prerequisites

- Python 3.8+
- OpenAI API key
- Jupyter Notebook (for running the demo)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cold-email-agent.git
   cd cold-email-agent
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## 🚀 Usage

### Quick Start

1. **Open the notebook**
   ```bash
   jupyter notebook main.ipynb
   ```

2. **Update your personal information**
   - Edit the `personal_info` dictionary in Cell 4
   - Add your name, university, skills, projects, experience, etc.

3. **Add a job posting**
   - Replace the `sample_job_posting` in Cell 6 with your target job posting

4. **Generate your email**
   - Run Cell 7 for single-agent approach
   - Run the multi-agent cells for advanced approach

### Personal Information Format

```python
personal_info = {
    "name": "Your Full Name",
    "university": "Your University",
    "major": "Your Major",
    "graduation_year": 2027,
    "skills": ["Python", "React", "SQL"],
    "projects": [
        {
            "name": "Project Name",
            "description": "Brief description",
            "technologies": ["Tech1", "Tech2"]
        }
    ],
    "experience": [
        {
            "role": "Your Role",
            "company": "Company Name",
            "duration": "Time Period",
            "description": "What you did"
        }
    ],
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername",
    "email": "your.email@example.com"
}
```

## 📊 Monitoring

View detailed traces of your agent workflows at:
https://platform.openai.com/traces

## 🔧 Customization

### Adding New Agents

You can easily add new specialized agents:

```python
new_agent = Agent(
    name="Your Agent Name",
    instructions="Your agent instructions",
    model="gpt-4o-mini"
)

# Convert to tool
new_tool = new_agent.as_tool(
    tool_name="your_tool_name",
    tool_description="What your tool does"
)

# Add to tools list
tools.append(new_tool)
```

### Modifying Agent Instructions

Each agent's behavior can be customized by modifying their instructions in the notebook.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with OpenAI's Agents SDK
- Inspired by the multi-agent architecture patterns
- Designed for internship seekers and career development

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the OpenAI documentation for Agents SDK
- Review the traces in OpenAI's dashboard for debugging

---

**Happy job hunting! 🎯** 