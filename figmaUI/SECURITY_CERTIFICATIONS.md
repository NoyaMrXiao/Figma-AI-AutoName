# Security Standards and Certifications

## Overview

This document describes the current status of security standard certifications and security practices followed by the AI Auto Naming Figma plugin and its backend services.

## Current Certification Status

### Formal Certifications

Currently, our services have not obtained the following formal security standard certifications:

- **ISO 27001**: Information Security Management System (ISMS) certification - Not obtained
- **SOC 2**: Service Organization Control Type 2 report - Not obtained
- **PCI DSS**: Payment Card Industry Data Security Standard - Not applicable (we do not process payment card data)
- **HITRUST**: Health Information Trust Alliance certification - Not applicable (we do not process health information)
- **SSAE 18**: Statement on Standards for Attestation Engagements No. 18 - Not obtained

### Certification Plans

As a small development team, we are currently evaluating the feasibility of obtaining formal security certifications. We recognize the importance of security certifications and plan to consider obtaining the following certifications in the future based on business development needs:

- **ISO 27001**: As a long-term goal, we plan to establish an Information Security Management System that complies with ISO 27001 standards
- **SOC 2 Type II**: If the service scale expands, we will consider conducting SOC 2 audits

## Security Practices Followed

Although we have not obtained formal certifications, we actively follow industry-recognized security best practices and standards:

### 1. Data Security

- **Environment Variable Management**: All sensitive information (such as API Keys) is managed through environment variables and never hardcoded in code
- **Code Repository Security**: `.env` files have been added to `.gitignore` to ensure sensitive information is not committed to version control systems
- **Data Transmission Encryption**: All API communications use HTTPS/TLS encryption
- **Data Minimization**: Only collect and process data necessary to provide services

### 2. Access Control

- **API Key Security**: OpenAI API Keys are stored in server-side environment variables and are not accessible to clients
- **Network Access Restrictions**: The Figma plugin is configured with an allowed domain whitelist (`networkAccess.allowedDomains`), restricting access to authorized backend services only
- **Request Validation**: All API requests undergo strict parameter validation and type checking

### 3. Infrastructure Security

- **Dependency Management**: Regularly update dependency packages to fix known security vulnerabilities
- **Request Size Limits**: Set reasonable request body size limits (50MB) to prevent resource exhaustion attacks
- **Error Handling**: Implement appropriate error handling mechanisms to avoid leaking sensitive information
- **Logging**: Record necessary operation logs while avoiding logging sensitive information

### 4. Code Security

- **Type Safety**: Use TypeScript for type checking to reduce runtime errors
- **Input Validation**: Validate and sanitize all user inputs
- **CORS Configuration**: Properly configure Cross-Origin Resource Sharing (CORS) policies
- **Secure Coding Practices**: Follow OWASP Top 10 secure coding best practices

### 5. Security Monitoring and Response

- **Health Check Endpoint**: Provide `/health` endpoint for service health monitoring
- **Error Monitoring**: Implement error logging and monitoring
- **Security Vulnerability Management**: Established security vulnerability reporting and response process (see [SECURITY.md](./SECURITY.md) for details)

### 6. Third-Party Service Security

- **API Service Provider**: We use OpenAI's API services, which themselves follow strict security standards
- **Dependency Review**: Regularly review and update third-party dependency libraries
- **Service Provider Evaluation**: When selecting third-party service providers, we evaluate their security practices

## Security Control Measures

### Technical Controls

1. **Encrypted Transmission**: All data transmission uses TLS 1.2 or higher
2. **Parameter Validation**: Strict input validation and type checking
3. **Request Limits**: Request body size limits and batch request quantity limits
4. **Error Handling**: Secure error handling that does not leak sensitive information

### Administrative Controls

1. **Security Policy**: Established security vulnerability management process
2. **Access Control**: Restrict access to sensitive information
3. **Change Management**: Code changes are managed through version control systems
4. **Documentation Management**: Maintain security-related documentation

### Operational Controls

1. **Monitoring**: Service health status monitoring
2. **Logging**: Operation log recording
3. **Backup**: Version control backup of code and configuration
4. **Response**: Security incident response process

## Compliance Statement

### Data Privacy

- **Data Collection**: We only collect and process data necessary to provide services (Figma element information)
- **Data Storage**: Data is temporarily processed during API calls and is not stored long-term
- **Data Sharing**: Data is only used to provide AI naming services and is not shared with third parties (except for necessary API service providers)

### Service Scope

Our service scope is relatively limited:

- **Functionality**: Provide AI-powered naming suggestions for Figma elements
- **Data Processing**: Temporarily process Figma design element information
- **Not Involved**: We do not process payment information, personally identifiable information (PII), or health information

## Continuous Improvement

We are committed to continuously improving security practices:

1. **Regular Review**: Regularly review and update security measures
2. **Security Training**: Team continuously learns security best practices
3. **Vulnerability Management**: Actively respond to and handle security vulnerability reports
4. **Standards Alignment**: Gradually align with industry security standard requirements

## Transparency Commitment

We commit to:

- **Honest Disclosure**: Truthfully state the current security certification status
- **Continuous Improvement**: Continuously improve security practices
- **Open Communication**: Accept security-related inquiries and reports through security email (3090699578xx@gmail.com)

## Future Plans

Based on business development needs, we plan to:

1. **Short-term (6-12 months)**:
   - Improve security documentation and processes
   - Implement stricter security monitoring
   - Conduct regular security audits

2. **Medium-term (1-2 years)**:
   - Evaluate the feasibility of obtaining ISO 27001 certification
   - Consider conducting SOC 2 Type I audits

3. **Long-term (2+ years)**:
   - Consider obtaining formal security certifications based on business scale
   - Establish a more comprehensive Information Security Management System

## Contact Information

For any questions about security certifications or security practices, please contact us through the following channels:

- **Security Email**: 3090699578xx@gmail.com
- **General Inquiries**: Please contact us through the Figma Community plugin page

## Changelog

- **2025-11-11**: Initial version release

---

**Note**: This document is regularly updated to reflect any changes in our security practices and certification status. Please check regularly for the latest information.
