async createJob(req: any, res: any) {
    try {
      const { role, description, payment_type, startup_id } = req.body;

      const userId = req.user?.id;

      console.log("userId: " + userId);

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized: User ID is required",
        });
      }

      // Validate required fields
      if (!role || !description || !payment_type || !startup_id) {
        return res.status(400).json({
          error: "Missing required fields: role, description, payment_type, and startup_id are required",
        });
      }

      // Validate payment_type enum values
      const validPaymentTypes = ['PAID', 'UNPAID', 'EQUITY_SPLIT'];
      if (!validPaymentTypes.includes(payment_type)) {
        return res.status(400).json({
          error: "Invalid payment_type. Must be one of: PAID, UNPAID, EQUITY_SPLIT",
        });
      }

      // Check if the startup exists and belongs to the user
      const { data: startup, error: startupError } = await supabase
        .from("startups")
        .select("id")
        .eq("id", startup_id)
        .eq("user_id", userId)
        .single();

      if (startupError) {
        console.error("Error checking startup ownership:", startupError);
        return res.status(404).json({
          error: "Startup not found or you don't have permission to create jobs for this startup",
        });
      }

      // Create the job posting
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert([
          {
            role,
            description,
            payment_type,
            startup_id,
            created_at: new Date(),
          },
        ])
        .select();

      if (jobError) {
        console.error("Error creating job:", jobError);
        return res.status(500).json({
          error: "Failed to create job posting",
          details: jobError.message,
        });
      }

      return res.status(201).json({
        message: "Job posting created successfully",
        job: jobData[0],
      });
    } catch (error: any) {
      console.error("Server error:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }