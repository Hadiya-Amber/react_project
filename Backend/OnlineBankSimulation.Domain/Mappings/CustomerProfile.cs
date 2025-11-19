using AutoMapper;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Mappings
{
    public class CustomerProfile : Profile
    {
        public CustomerProfile()
        {
            CreateMap<CustomerRegistrationDto, UserCreateDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserRole.Customer));
        }
    }
}