import streamlit as st
import google.generativeai as genai

'''

A basic template for an AI-based text editor.

TODO: see requirments from phase 1 and phase 2 reports


'''

genai.configure(api_key="YOUR_GOOGLE_GEMINI_API_KEY")


model = genai.GenerativeModel('gemini-pro')

st.set_page_config(page_title="AI Text Editor with Gemini")

st.title("AI-Powered Text Editor")
st.write("Enhance your writing using Google Gemini!")


user_input = st.text_area("Enter your text here:", height=300)


action = st.selectbox(
    "Choose an action:",
    ("Rewrite", "Summarize", "Expand")
)

if st.button("Generate"):
    if user_input.strip() == "":
        st.warning("Please enter some text first.")
    else:
   
        if action == "Rewrite":
            prompt = f"Rewrite the following text to improve clarity and style:\n\n{user_input}"
        elif action == "Summarize":
            prompt = f"Summarize the following text:\n\n{user_input}"
        elif action == "Expand":
            prompt = f"Expand and elaborate on the following text:\n\n{user_input}"


        try:
            response = model.generate_content(prompt)
            edited_text = response.text

            st.subheader(f"Result: {action}")
            st.text_area("AI Output", value=edited_text, height=300)
        except Exception as e:
            st.error(f"An error occurred: {e}")


st.markdown("---")
