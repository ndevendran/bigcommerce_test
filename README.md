Cornerstone Test:

I cloned the Cornerstone theme repo and performed the following steps to make the required changes.<br />

1)First I created the secondary image on hover. I found the secondary image's url in the product object. I put it under the figcaption class so it could inherit on hover and gave it the appropriate card classes so it could cover the original image.
2)Second I added the "Add All To Cart" button. I originally used the front work to pass the cart object into the template and then used inline scripts to make manual calls to the Storefront API with the cartId and the Product ID. I did the same with the "Remove All From Cart". I opted to delete the entire cart instead of removing the items one line at a time because it was simpler. There was a bug that caused the Remove button to fail because a call to getCart was made for a deleted cart.
3)When I learned about the PageManager Javascript files I moved the inline scripts into the category.js PageManager file. Not only was I able to take out inline scripts but I had an easier time accessing the context. I was able to prevent the getCart call from failing by setting the cartId to null after the cart was deleted.
4)The Javascript file also made the modal easier. Using the modal class I grabbed the default modal, styled it until it looked appropriate, and called it in the onclick function of the Remove button. I was able to use the onModalClose hook to reload the page when the modal closed. I couldn't find a way to refresh the cart object without a page reload.
5)The customer data was already available in the category file and I was able to iterate over it in Handlebars. I found the banner styles with a simple search.
