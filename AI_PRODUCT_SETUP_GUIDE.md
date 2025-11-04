# AI Product Creation Setup Guide

This guide will help you set up AI-powered product creation in your MustiApp admin dashboard.

## 🚀 Features

- **AI Product Generation**: Create products using AI with detailed descriptions, pricing, and nutritional information
- **AI Image Generation**: Generate professional product photos using DALL-E
- **Smart Categorization**: AI automatically categorizes products and suggests addons
- **Nutritional Analysis**: AI calculates calories, protein, carbs, fat, and fiber
- **Dietary Tags**: Automatic tagging for vegetarian, vegan, gluten-free, etc.
- **Database Integration**: Products are saved directly to your Supabase database

## 📋 Prerequisites

1. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Supabase Database**: Your existing MustiApp database
3. **Admin Dashboard**: The Next.js admin dashboard

## 🛠️ Setup Instructions

### 1. Database Setup

First, run the database migration to add AI-specific fields:

```sql
-- Run this in your Supabase SQL editor
\i add-ai-product-fields.sql
```

This will add the following fields to your `menu_items` table:
- `ai_generated` - Boolean flag for AI-generated products
- `ai_prompt` - The prompt used to generate the product
- `nutritional_info` - JSON field with nutritional data
- `ingredients` - Array of ingredients
- `dietary_tags` - Array of dietary tags
- `difficulty_level` - Easy, medium, or hard
- `spice_level` - Mild, medium, hot, or extra hot
- `cuisine_type` - Type of cuisine
- `cooking_method` - Method of cooking
- And more...

### 2. Environment Variables

Create a `.env.local` file in your admin dashboard directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional: Alternative AI Services
REPLICATE_API_TOKEN=your_replicate_token
STABILITY_API_KEY=your_stability_api_key
```

### 3. Install Dependencies

```bash
cd admin-dashboard
npm install @supabase/supabase-js
```

### 4. API Key Setup

1. **Get OpenAI API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env.local` file

2. **Set up Billing**:
   - Add payment method to your OpenAI account
   - Set usage limits to control costs
   - DALL-E 3 costs ~$0.04 per image
   - GPT-4 costs ~$0.03 per 1K tokens

## 🎯 Usage Guide

### Creating AI Products

1. **Access AI Products Page**:
   - Go to your admin dashboard
   - Click on "AI Products" in the sidebar
   - Click "Create AI Product"

2. **Fill Product Form**:
   - **Product Name**: e.g., "Spicy Thai Basil Chicken"
   - **Description**: Brief description (optional)
   - **Category**: Select from dropdown
   - **Cuisine Type**: Italian, Chinese, Mexican, etc.
   - **Key Ingredients**: Comma-separated list
   - **Dietary Restrictions**: Gluten-free, vegan, etc.
   - **Cooking Method**: Grilled, fried, baked, etc.
   - **Spice Level**: Mild, medium, hot, extra hot
   - **Difficulty Level**: Easy, medium, hard
   - **Prep/Cook Time**: In minutes

3. **Generate Product**:
   - Click "Generate Product"
   - AI will create detailed product information
   - Review the generated data

4. **Generate Image**:
   - Click "Generate Image"
   - AI will create a professional product photo
   - Review the generated image

5. **Save to Database**:
   - Click "Save to Database"
   - Product will be added to your menu
   - Available immediately in your app

### Managing AI Products

- **View All AI Products**: Browse generated products with filters
- **Search**: Search by name or description
- **Filter**: Filter by category, status, or dietary tags
- **Edit**: Modify AI-generated products
- **Delete**: Remove products from database
- **Stats**: View AI product statistics

## 🔧 Advanced Configuration

### Customizing AI Prompts

You can modify the AI prompts in `admin-dashboard/lib/ai-service.ts`:

```typescript
// Modify the product generation prompt
const createProductPrompt = (request: AIProductRequest): string => {
  // Customize the prompt for your restaurant's style
  let prompt = `Create a detailed food product for ${YOUR_RESTAURANT_NAME}...`;
  // Add your custom requirements
};
```

### Adding Custom Categories

Update the category options in `AIProductCreator.tsx`:

```typescript
<SelectContent>
  <SelectItem value="your_custom_category">Your Custom Category</SelectItem>
  // Add more categories
</SelectContent>
```

### Nutritional Requirements

Modify nutritional calculations in the AI service:

```typescript
// Adjust nutritional calculation logic
const calculateNutrition = (ingredients: string[], cookingMethod: string) => {
  // Your custom nutritional calculation logic
};
```

## 💰 Cost Management

### OpenAI Pricing (as of 2024)

- **GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **DALL-E 3**: $0.04 per 1024x1024 image
- **Typical Product Generation**: ~$0.10-0.20 per product

### Cost Optimization Tips

1. **Batch Generation**: Generate multiple products at once
2. **Reuse Images**: Use the same image for similar products
3. **Set Limits**: Implement daily/monthly generation limits
4. **Cache Results**: Store generated data to avoid regeneration

## 🚨 Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**:
   - Check your `.env.local` file
   - Restart your development server
   - Verify the API key is valid

2. **"Failed to generate product"**:
   - Check your OpenAI account balance
   - Verify API key permissions
   - Check rate limits

3. **"Failed to save to database"**:
   - Check Supabase connection
   - Verify database permissions
   - Check if the database migration was run

4. **"Image generation failed"**:
   - Check DALL-E 3 availability
   - Verify image prompt is appropriate
   - Check OpenAI service status

### Debug Mode

Enable debug logging in your environment:

```bash
DEBUG=ai-service
NODE_ENV=development
```

## 📊 Monitoring & Analytics

### Track AI Usage

Monitor your AI product generation:

```sql
-- Get AI product statistics
SELECT * FROM get_ai_product_stats();

-- Search by nutritional criteria
SELECT * FROM search_ai_products_by_nutrition(
  max_calories := 500,
  min_protein := 20,
  dietary_requirements := ARRAY['vegetarian', 'gluten-free']
);
```

### View AI Products

```sql
-- View all AI-generated products
SELECT * FROM ai_products_view;

-- Get AI products by cuisine
SELECT * FROM ai_products_view WHERE cuisine_type = 'italian';
```

## 🔒 Security Considerations

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Rate Limiting**:
   - Implement rate limiting for AI generation
   - Set daily/monthly limits
   - Monitor usage patterns

3. **Content Moderation**:
   - Review AI-generated content before publishing
   - Implement content filters
   - Monitor for inappropriate content

## 🚀 Next Steps

1. **Test the Setup**: Create a few AI products to test the system
2. **Customize Prompts**: Adjust AI prompts for your restaurant's style
3. **Set Up Monitoring**: Monitor costs and usage
4. **Train Staff**: Train your team on using the AI system
5. **Scale Up**: Gradually increase AI product generation

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the OpenAI API documentation
3. Check your Supabase logs
4. Contact support with specific error messages

## 🎉 Success!

Once set up, you'll be able to:
- Generate unlimited AI products
- Create professional product photos
- Automatically categorize and tag products
- Save products directly to your database
- Use products immediately in your app

Your AI-powered restaurant management system is now ready! 🍕🤖
