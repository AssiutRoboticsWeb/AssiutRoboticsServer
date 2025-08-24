const { 
    handleValidationErrors,
    validateMemberRegistration,
    validateMemberLogin,
    validatePasswordChange,
    validateOTPGeneration,
    validateOTPVerification,
    validateMemberId,
    validateCommittee
} = require('../../../middleware/validation');

describe('Validation Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = testUtils.mockRequest();
    mockRes = testUtils.mockResponse();
    mockNext = testUtils.mockNext();
  });

  describe('handleValidationErrors', () => {
    it('should call next() when no validation errors', () => {
      // Mock validationResult to return no errors
      jest.doMock('express-validator', () => ({
        validationResult: () => ({
          isEmpty: () => true,
          array: () => []
        })
      }));

      handleValidationErrors(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next with error when validation fails', () => {
      // Mock validationResult to return errors
      jest.doMock('express-validator', () => ({
        validationResult: () => ({
          isEmpty: () => false,
          array: () => [
            { param: 'email', msg: 'Invalid email' },
            { param: 'password', msg: 'Password required' }
          ]
        })
      }));

      handleValidationErrors(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed: email: Invalid email, password: Password required'
        })
      );
    });
  });

  describe('validateMemberRegistration', () => {
    it('should validate valid member registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        committee: 'Software',
        gender: 'male',
        phoneNumber: '01234567890'
      };

      mockReq.body = validData;
      
      // This should not throw any errors
      expect(() => {
        validateMemberRegistration[0](mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
        committee: 'Software',
        gender: 'male',
        phoneNumber: '01234567890'
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateMemberRegistration[1](mockReq, mockRes, mockNext);
      }).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        committee: 'Software',
        gender: 'male',
        phoneNumber: '01234567890'
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateMemberRegistration[2](mockReq, mockRes, mockNext);
      }).toThrow();
    });

    it('should reject invalid committee', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        committee: 'InvalidCommittee',
        gender: 'male',
        phoneNumber: '01234567890'
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateMemberRegistration[4](mockReq, mockRes, mockNext);
      }).toThrow();
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        committee: 'Software',
        gender: 'male',
        phoneNumber: '12345'
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateMemberRegistration[5](mockReq, mockRes, mockNext);
      }).toThrow();
    });
  });

  describe('validateMemberLogin', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123'
      };

      mockReq.body = validData;
      
      expect(() => {
        validateMemberLogin[0](mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateMemberLogin[0](mockReq, mockRes, mockNext);
      }).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: ''
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateMemberLogin[1](mockReq, mockRes, mockNext);
      }).toThrow();
    });
  });

  describe('validatePasswordChange', () => {
    it('should validate valid password change data', () => {
      const validData = {
        currentPassword: 'oldpass123',
        newPassword: 'NewSecurePass123!'
      };

      mockReq.body = validData;
      
      expect(() => {
        validatePasswordChange[1](mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should reject weak new password', () => {
      const invalidData = {
        currentPassword: 'oldpass123',
        newPassword: 'weak'
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validatePasswordChange[1](mockReq, mockRes, mockNext);
      }).toThrow();
    });
  });

  describe('validateOTPGeneration', () => {
    it('should validate valid email for OTP generation', () => {
      const validData = {
        email: 'john@example.com'
      };

      mockReq.body = validData;
      
      expect(() => {
        validateOTPGeneration[0](mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email'
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateOTPGeneration[0](mockReq, mockRes, mockNext);
      }).toThrow();
    });
  });

  describe('validateOTPVerification', () => {
    it('should validate valid OTP verification data', () => {
      const validData = {
        email: 'john@example.com',
        otp: '123456'
      };

      mockReq.body = validData;
      
      expect(() => {
        validateOTPVerification[0](mockReq, mockRes, mockNext);
      }).not.toThrow();
      
      expect(() => {
        validateOTPVerification[1](mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should reject invalid OTP format', () => {
      const invalidData = {
        email: 'john@example.com',
        otp: '12345' // Too short
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateOTPVerification[1](mockReq, mockRes, mockNext);
      }).toThrow();
    });

    it('should reject non-numeric OTP', () => {
      const invalidData = {
        email: 'john@example.com',
        otp: 'abcdef' // Non-numeric
      };

      mockReq.body = invalidData;
      
      expect(() => {
        validateOTPVerification[1](mockReq, mockRes, mockNext);
      }).toThrow();
    });
  });

  describe('validateMemberId', () => {
    it('should validate valid MongoDB ObjectId', () => {
      mockReq.params = {
        memberId: '507f1f77bcf86cd799439011'
      };
      
      expect(() => {
        validateMemberId[0](mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should reject invalid ObjectId format', () => {
      mockReq.params = {
        memberId: 'invalid-id'
      };
      
      expect(() => {
        validateMemberId[0](mockReq, mockRes, mockNext);
      }).toThrow();
    });
  });

  describe('validateCommittee', () => {
    it('should validate valid committee', () => {
      mockReq.params = {
        com: 'Software'
      };
      
      expect(() => {
        validateCommittee[0](mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should reject invalid committee', () => {
      mockReq.params = {
        com: 'InvalidCommittee'
      };
      
      expect(() => {
        validateCommittee[0](mockReq, mockRes, mockNext);
      }).toThrow();
    });
  });
});
