const supabase = supabase.createClient(
  'https://admzruvjhjblgqrrrbis.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbXpydXZqaGpibGdxcnJyYmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODAxNTQsImV4cCI6MjA2NTg1NjE1NH0.tw-0Wbp_SyXsDswWTamGTglZiddnjFr6QVsk1K0HI98'
);

const pathParts = window.location.pathname.split('/');

// assumes the slug is the LAST part of the path
const slug = pathParts[pathParts.length - 1];

let outfitId = null;
let selectedVote = null;

async function fetchOutfit() {
  const { data, error } = await supabase
    .from('outfits_links')
    .select('outfit_id')
    .eq('slug', slug)
    .single();

  if (!data) {
    document.getElementById('content').innerHTML = "Invalid link";
    return;
  }

  outfitId = data.outfit_id;

  const { data: outfit } = await supabase
    .from('outfits')
    .select('caption, media_urls')
    .eq('id', outfitId)
    .single();

  document.getElementById('caption').innerText = outfit.caption;

  const imagesContainer = document.getElementById('images');
  imagesContainer.innerHTML = ''; // clear existing

  if (Array.isArray(outfit.media_urls)) {
    outfit.media_urls.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = "Outfit image";
      img.style.width = "120px";
      img.style.height = "120px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      imagesContainer.appendChild(img);
    });
  } else {
    imagesContainer.innerHTML = "No images";
  }
}

document.getElementById('hot-btn').addEventListener('click', () => {
  selectedVote = 'hot';
  document.getElementById('phone-section').style.display = 'block';
});
document.getElementById('cold-btn').addEventListener('click', () => {
  selectedVote = 'cold';
  document.getElementById('phone-section').style.display = 'block';
});

document.getElementById('send-code').addEventListener('click', async () => {
  const phone = document.getElementById('phone').value;
  await supabase.auth.signInWithOtp({ phone });
  document.getElementById('code-section').style.display = 'block';
});

document.getElementById('verify').addEventListener('click', async () => {
  const phone = document.getElementById('phone').value;
  const otp = document.getElementById('otp').value;

  const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });

  if (data?.session) {
    await supabase
      .from('votes')
      .insert({ outfit_id: outfitId, phone_number: phone, vote_value: selectedVote });
    document.getElementById('thanks').style.display = 'block';
  } else {
    alert("Failed to verify, try again!");
  }
});

fetchOutfit();
