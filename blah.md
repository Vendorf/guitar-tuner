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