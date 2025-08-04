<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon text-token-text-primary"><path d="M9.33468 3.33333C9.33468 2.96617 9.6326 2.66847 9.99972 2.66829C10.367 2.66829 10.6648 2.96606 10.6648 3.33333V15.0609L15.363 10.3626L15.4675 10.2777C15.7255 10.1074 16.0762 10.1357 16.3034 10.3626C16.5631 10.6223 16.5631 11.0443 16.3034 11.304L10.4704 17.137C10.2108 17.3967 9.7897 17.3966 9.52999 17.137L3.69601 11.304L3.61105 11.1995C3.44054 10.9414 3.46874 10.5899 3.69601 10.3626C3.92328 10.1354 4.27479 10.1072 4.53292 10.2777L4.63741 10.3626L9.33468 15.0599V3.33333Z"></path></svg>




// smoke effect thing

<html lang="en">
<head>
<style>
body {
  background: #111;
  margin: 0;
  height: 100vh;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}

.campfire-smoke {
  position: relative;
  width: 120px;
  height: 300px;
}

.wisp {
  position: absolute;
  bottom: 0;
  width: 20px;
  height: 200px;
  background: radial-gradient(ellipse at center, rgba(200,200,200,1), transparent 70%);
  filter: blur(4px);
  opacity: 0;
  
  /* Smoke movement */
  animation:
    rise 8s ease-in-out infinite,
    ripple 6s linear infinite;

  /* Use wavy repeating mask pattern */
  mask-image: url('data:image/svg+xml;utf8,\
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="60" viewBox="0 0 20 60" preserveAspectRatio="none">\
      <defs>\
        <linearGradient id="folds" x1="0" x2="0" y1="0" y2="1">\
          <stop offset="0%" stop-color="white" stop-opacity="0.05"/>\
          <stop offset="25%" stop-color="white" stop-opacity="0.8"/>\
          <stop offset="50%" stop-color="white" stop-opacity="0.1"/>\
          <stop offset="75%" stop-color="white" stop-opacity="0.9"/>\
          <stop offset="100%" stop-color="white" stop-opacity="0.1"/>\
        </linearGradient>\
      </defs>\
      <rect width="20" height="60" fill="url(#folds)" />\
    </svg>');
  mask-size: 100% auto;
  mask-repeat: repeat-y;
  mask-position: 0 0;

  -webkit-mask-image: inherit;
  -webkit-mask-size: inherit;
  -webkit-mask-repeat: inherit;
  -webkit-mask-position: inherit;
}

.w0 { left: 10px; animation-delay: 0s; }
.w1 { left: 10px; animation-delay: 1.5s; }
.w2 { left: 10px; animation-delay: 3s; }
.w3 { left: 10px; animation-delay: 4.5s; }
.w4 { left: 10px; animation-delay: 6s; }

@keyframes rise {
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  20%  { opacity: 0.3; }
  50%  { transform: translateY(-80px) scaleX(1.2) scaleY(1.3); opacity: 0.4; }
  80%  { opacity: 0.1; }
  100% { transform: translateY(-180px) scale(1.5); opacity: 0; }
}

@keyframes ripple {
  0%   { mask-position: 0 0; -webkit-mask-position: 0 0; }
  100% { mask-position: 0 -200px; -webkit-mask-position: 0 -200px; }
}
</style>
</head>
<body>

<div class="campfire-smoke">
  <div class="wisp w0"></div>
  <div class="wisp w1"></div>
  <div class="wisp w2"></div>
  <div class="wisp w3"></div>
  <div class="wisp w4"></div>
</div>

</body>
</html>







/* https://css-tricks.com/books/greatest-css-tricks/scroll-shadows/ */
.scroll-shadows {
  background:
    /* Shadow Cover TOP */
    linear-gradient(
        to right,
      white 30%,
      rgba(255, 255, 255, 0)
    ) left,
    
    /* Shadow Cover BOTTOM */
    linear-gradient(
        to left,
      rgba(255, 255, 255, 0), 
      white 70%
    ) right,
    
    /* Shadow TOP */
    radial-gradient(
      farthest-side at 50% 0,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0)
    ) left,
    
    /* Shadow BOTTOM */
    radial-gradient(
      farthest-side at 50% 100%,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0)
    ) right;
  
  background-repeat: no-repeat;
  background-size: 40px 100%, 40px 100%, 14px 100%, 14px 100%;
  background-attachment: local, local, scroll, scroll;
}



Here's how to create a larger border on hover in CSS, including several options to address potential layout shifts:
1. Simple border change (with potential layout shift)
This is the most straightforward approach, where the border width is simply increased on hover. Be aware that this can cause surrounding elements to shift if the element's total size changes when the border expands. 
css
.my-element {
  border: 1px solid blue;
  transition: border-width 0.3s ease-in-out; /* Smooth transition */
}

.my-element:hover {
  border-width: 5px; /* Thicker border on hover */
}
2. Preventing layout shifts
a) Using box-sizing: border-box
This method ensures the border width is included within the element's overall dimensions, preventing layout changes when the border width increases. 
css
.my-element {
  box-sizing: border-box; /* Include padding and border in element's total size */
  border: 1px solid blue;
  transition: border-width 0.3s ease-in-out;
}

.my-element:hover {
  border-width: 5px;
}
b) Using a transparent initial border
By having a transparent border of the target thickness in the default state, and then changing its color on hover, you avoid dimension changes. 
css
.my-element {
  border: 5px solid transparent; /* Maintain border space without showing it initially */
  transition: border-color 0.3s ease-in-out;
}

.my-element:hover {
  border-color: blue; /* Change to desired border color on hover */
}
c) Using box-shadow
This approach creates the appearance of a thicker border without using the actual border property, therefore avoiding layout shifts. 
css
.my-element {
  box-shadow: 0 0 0 1px blue; /* Initial border-like shadow */
  transition: box-shadow 0.3s ease-in-out;
}

.my-element:hover {
  box-shadow: 0 0 0 5px blue; /* Thicker shadow on hover */
}
3. Enlarging the element on hover
If you intend for the element to slightly expand along with the border, you can combine transform: scale() with the border styling. 
css
.my-element {
  border: 1px solid blue;
  transition: all 0.3s ease-in-out; /* Transition all properties for smooth effect */
}

.my-element:hover {
  border-width: 5px;
  transform: scale(1.1); /* Slightly enlarge the element */
}
Tips for smoother transitions
Always include the transition property on the base element style to ensure a smooth animation when the hover effect is applied and removed.
Use appropriate transition-duration and transition-timing-function values to control the speed and easing of the animation.
Consider browser compatibility if using advanced features or older browsers. 