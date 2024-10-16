
  const ctx = document.getElementById("userDataChart").getContext("2d");
  const totalCommentsCount =document.getElementById("totalCommentsCount").textContent;
  const totalPosts = document.getElementById("totalPosts").textContent;
  const totalUsers= document.getElementById("totalUsers").textContent;
  

  const userAnalysisChart = new Chart(ctx, {
    type: "bar", // Use "bar" or "doughnut" for a different representation
    data: {
      labels: ["Users", "Posts", "Comments"], // Labels for the chart
      datasets: [
        {
          label: "Chart", // Dataset label
          data: [totalUsers, totalPosts, totalCommentsCount], // Replace with dynamic data if needed
          backgroundColor: [
            "#ff6384", // Color for Users
            "#36a2eb", // Color for Posts
            "#cc65fe", // Color for Comments
          ],
          borderColor: "#fff", // Border color
          borderWidth: 1, // Border width
        },
      ],
    },
    options: {
      responsive: true, // Make the chart responsive
      scales: {
        y: {
          beginAtZero: true, // Start y-axis at zero
        },
      },
      plugins: {
        legend: {
          display: true, // Display the legend
          position: "top", // Position of the legend
        },
      },
    },
  });



