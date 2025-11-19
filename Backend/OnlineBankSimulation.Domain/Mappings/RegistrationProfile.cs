using AutoMapper;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Models;

namespace OnlineBank.Core.Mappings
{
    public class RegistrationProfile : Profile
    {
        public RegistrationProfile()
        {
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch != null ? src.Branch.BranchName : null))
                .ForMember(dest => dest.Age, opt => opt.MapFrom(src => DateTime.UtcNow.Year - src.DateOfBirth.Year));

            CreateMap<RegisterCustomerDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<CreateEmployeeDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }
    }
}